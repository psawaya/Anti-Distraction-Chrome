
var lastTabId = null;

var tabsBothered = [];

var lastNotification = null;
var lastNotificationTimeout = null;

var origURL = "";

var notifs = {};
var lastNotifID = 0;

var notifsDisabledMinutesRemaining = 0;

function startNotifsDisabledTimer() {
	notifsDisabledMinutesRemaining = 10;
	var timer = setInterval(function(){
		notifsDisabledMinutesRemaining--;
		if (notifsDisabledMinutesRemaining == 0)
			clearInterval(timer);
	}, 60*1000);
}

function getNotifData() {
	var notifData = {
		"notif_id": lastNotifID,
		"url": origURL,
		"tab_id": lastTabId,
		"notif_obj": lastNotification
	};
	notifs[lastNotifID] = notifData;
	lastNotifID++;
	return notifData;
}


function redir(data) {
	chrome.tabs.get(data.tab_id,function(tab) {
		tab.url = data.url;
		
		chrome.tabs.update(data.tab_id, {
			url:data.url
		});
		
		killNotif(notifs[data.notif_id].notif_obj);
		delete notifs[data.notif_id];
	});
}

function killNotif(notif) {
	notif.cancel();
	lastNotificationTimeout = null;
	lastNotification = null;
}

chrome.tabs.onUpdated.addListener(function(tabId,changeInfo) {
	if (notifsDisabledMinutesRemaining > 0) return;
	if (tabsBothered.indexOf(tabId) != -1) return;
	var uri = new Uri(changeInfo.url);
	chrome.tabs.get(tabId, function(tab) {
		if (tab.openerTabId) {
			chrome.tabs.get(tab.openerTabId, function(openerTab) {
				// If this new tab was opened from a tab we already bothered you about and is on the same domain, don't bother again
				if ((new Uri(openerTab.url)).host() == uri.host())
					tabsBothered.push(openerTab);
				else
					procTab();
			});
		}
		else {
			procTab();
		}
	});
	function procTab() {
		if (changeInfo.url) {
		
			var hostURIs = ["www.reddit.com",
							"news.ycombinator.com",
							"www.quora.com",
							"www.facebook.com",
							"twitter.com"];
			if (hostURIs.indexOf(uri.host()) > -1) {
				origURL = changeInfo.url;
				lastTabId = tabId;
			
				var metaDistractions = ['http://dynamic.xkcd.com/random/comic/',
					"http://www.ohnorobot.com/random.pl?comic=636",
					"http://icanhascheezburger.files.wordpress.com/2008/02/funny-pictures-cat-grabs-pink-crab-toy.jpg"];
			
				var distractionURL = metaDistractions[parseInt(Math.random()*metaDistractions.length)];
			
				chrome.tabs.update(lastTabId, {
					url: 'http://www.this-page-intentionally-left-blank.org/' //distractionURL
				});
				
				lastNotification = webkitNotifications.createHTMLNotification('notif.html');
				lastNotification.show();
			
				tabsBothered.push(tabId);
			}
		}
	}
});

chrome.tabs.onRemoved.addListener(function(tabId) {
	for (var notifID in notifs) {
		if (notifs[notifID].tab_id == tabId) {
			notifs[notifID].notif_obj.cancel();
			delete notifs[notifID];
		}
	}
	// If we bothered for this tabId, forget it now.
	var tabIdx = tabsBothered.indexOf(tabId);
	if (tabIdx != -1)
		tabsBothered.splice(tabIdx,1);
});