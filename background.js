chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
});
chrome.runtime.onMessage.addListener(function(msg) {
    if (msg.type === 'PO_OPEN_TAB' && msg.url) {
        chrome.tabs.create({ url: msg.url });
    }
});