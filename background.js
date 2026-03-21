var VEIL_CURRENT_VERSION = '2.5.7';
var UPDATE_CHECK_URL = 'https://raw.githubusercontent.com/meatballsong1/po-extension/main/version.json?t=';
var SNOOZE_KEY = 'veil_snooze_until';

function sendUpdateToPoTabs(latestVersion) {
    chrome.tabs.query({ url: '*://*.pocketoption.com/*' }, function(tabs) {
        if (!tabs || !tabs.length) return;
        tabs.forEach(function(tab) {
            chrome.tabs.sendMessage(tab.id, {
                type: 'PO_UPDATE_AVAILABLE',
                current: VEIL_CURRENT_VERSION,
                latest: latestVersion,
            }, function() { if (chrome.runtime.lastError) {} });
        });
    });
}

function checkForUpdate() {
    fetch(UPDATE_CHECK_URL + Date.now())
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data || !data.version) return;
            var latestVersion = data.version;
            if (latestVersion === VEIL_CURRENT_VERSION) return;

            chrome.storage.local.get(SNOOZE_KEY, function(d) {
                var snoozeUntil = (d && d[SNOOZE_KEY]) || 0;
                if (snoozeUntil && Date.now() < snoozeUntil) return;
                sendUpdateToPoTabs(latestVersion);
            });
        })
        .catch(function() {});
}

// Message handler
chrome.runtime.onMessage.addListener(function(msg) {
    if (!msg) return;
    if (msg.type === 'PO_OPEN_TAB' && msg.url) {
        chrome.tabs.create({ url: msg.url });
    }
});

// Check on page refresh — fires every time a PO tab finishes loading
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url && tab.url.indexOf('pocketoption.com') !== -1) {
        // Small delay so content.js is fully loaded before we message it
        setTimeout(function() { checkForUpdate(); }, 3000);
    }
});

// Also check every 5 minutes via alarm for background checking
chrome.alarms.create('veil-update-check', { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === 'veil-update-check') checkForUpdate();
});

// Check once on service worker start
checkForUpdate();