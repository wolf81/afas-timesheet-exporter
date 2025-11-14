chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "AFAS_EXPORT") {
    if (!sender.tab?.id) return;
    chrome.tabs.sendMessage(sender.tab.id, { type: "RUN_EXPORT" });
  }
});
