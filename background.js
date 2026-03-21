var VEIL_CURRENT_VERSION = '2.5.8';
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
    fetch('https://api.github.com/repos/meatballsong1/po-extension/releases/latest', {
        headers: { 'Accept': 'application/vnd.github+json' }
    })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data || !data.tag_name) return;
            // Strip leading 'v' so "v2.5.7" becomes "2.5.7"
            var latestVersion = data.tag_name.replace(/^v/, '');
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