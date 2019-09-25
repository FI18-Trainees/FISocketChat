$('document').ready(function(){
    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';

    // Safari 3.0+ "[object HTMLElementConstructor]" 
    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;

    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;

    // Chrome 1 - 71
    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!window.CSS;

    if ((isChrome || isSafari || isOpera)) {
        $('head').append('<link rel="stylesheet" type="text/css" href="/public/css/chrome-safari-opera.css">');
    } else if (isFirefox) {
        $('head').append('<link rel="stylesheet" type="text/css" href="/public/css/firefox.css">');
		$('body').append('<script src="/public/js/mutationObserver.js"></script>');
    } else if (isEdge) {
        $('head').append('<link rel="stylesheet" type="text/css" href="/public/css/edge.css">');
    }
});