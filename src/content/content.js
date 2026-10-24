window.getPalette = () => {
  chrome.runtime.sendMessage({
    type: "EXTRACT_COLORS",
    data: document.body.innerHTML
  });
};