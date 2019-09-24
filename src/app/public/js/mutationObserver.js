//More Details https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
// select the target node
var target = document.querySelector('#messages')
// create an observer instance
var observer = new MutationObserver(function(mutations) {
	if(target.childNodes.length <= 5){ } else { //prevent scrolling until 5 messages are sent
		window.scrollTo(0,document.body.scrollHeight);
	}
});
// configuration of the observer:
var config = { attributes: true, childList: true, characterData: true };
// pass in the target node, as well as the observer options
observer.observe(target, config);