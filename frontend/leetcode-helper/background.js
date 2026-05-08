// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "open_side_panel") {
    // Open the side panel for the specific window
    chrome.sidePanel.open({ windowId: sender.tab.windowId });
    sendResponse({ status: "ok" });
  }
  
  if (message.action === "save_problem_context") {
    chrome.storage.local.set({
      problemTitle: message.title,
      problemDescription: message.description
    });
    sendResponse({ status: "saved" });
  }
});
