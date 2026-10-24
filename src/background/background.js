chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "EXTRACT_COLORS") {
    console.log("Extracting colors...");
  }
});