function updateCount() {
	var minutesRemaining = chrome.extension.getBackgroundPage().notifsDisabledMinutesRemaining;
	document.getElementById('minutesRemaining').innerHTML = minutesRemaining.toString();
	showOrHideCount(minutesRemaining > 0)
}
		
function showOrHideCount(show) {
	document.getElementById('disableLink').style['display'] = show ? 'none' : 'block';
	document.getElementById('minutesRemainingDisplay').style['display'] = show ? 'block' : 'none';
}
		
function disable() {
	chrome.extension.getBackgroundPage().startNotifsDisabledTimer()
	updateCount();
}

function init() {
    document.getElementById('disableLink').addEventListener('click',disable);
    updateCount();
}

window.addEventListener('load',init,false);