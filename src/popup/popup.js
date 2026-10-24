const button = document.getElementById("extract");
const palette = document.getElementById("palette");

button.addEventListener("click", async () => {
  palette.replaceChildren();
  palette.textContent = "Scanning page…";

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (!tab?.id) {
      throw new Error("No active tab was found.");
    }

    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const found = new Set();
        const properties = [
          "color",
          "backgroundColor",
          "borderTopColor",
          "borderRightColor",
          "borderBottomColor",
          "borderLeftColor",
          "outlineColor",
          "textDecorationColor",
          "fill",
          "stroke"
        ];

        function toHex(value) {
          const match = value.match(
            /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/
        );

          if (!match) return null;
          if (match[4] !== undefined && Number(match[4]) === 0) return null;

          return "#" + match.slice(1, 4)
            .map((part) => Number(part).toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase();
        }

        for (const element of document.querySelectorAll("*")) {
          const styles = getComputedStyle(element);

          for (const property of properties) {
            const hex = toHex(styles[property]);
            if (hex) found.add(hex);
          }
        }

        return [...found].sort();
      }
    });

    const colors = injection?.result ?? [];
    palette.replaceChildren();

    if (colors.length === 0) {
      palette.textContent = "No colors found on this page.";
      return;
    }

    for (const hex of colors) {
      const row = document.createElement("div");
      row.className = "color-row";

      const swatch = document.createElement("span");
      swatch.className = "swatch";
      swatch.style.backgroundColor = hex;

      const label = document.createElement("code");
      label.textContent = hex;

      row.append(swatch, label);
      palette.append(row);
    }
  } catch (error) {
    palette.textContent =
      `Could not scan this page: ${error.message}. Try a regular website.`;
  }
});