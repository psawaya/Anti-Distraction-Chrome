
var count = 10;

var countdownElem = null;
		
var notifData = chrome.extension.getBackgroundPage().getNotifData();
		
function updateCountdown() {
	countdownElem.innerHTML = count.toString();
}
		
function panic() {
	if (count <= 0)
		chrome.extension.getBackgroundPage().redir(notifData);
	else
		count--;
				
	updateCountdown();			
}
		
function init() {
    document.getElementById('panic-link').addEventListener(panic);
    
	countdownElem = document.getElementById('countdown');
				
	updateCountdown();
			
	setInterval(panic,1000);
}

window.addEventListener('load',init,false);