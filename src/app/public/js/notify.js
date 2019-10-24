//More info here: https://developer.mozilla.org/de/docs/Web/API/notification

var notifications = new Array();

window.onload = function () {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    }

    // Let's check whether notification permissions have already been granted
    else if (checkPermission()) {
    //    // If it's okay let's create a notification
    //    new Notification("Welcome back!");
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            // If the user accepts, let's create a notification
            if (checkPermission()) {
                new Notification("This is how a notification would appear!");
            }
        });
    }
    // At last, if the user has denied notifications, and you 
    // want to be respectful there is no need to bother them any more.
};

//create new notification with the variable "text" as content
function newNotification(text) {
    var notification = new Notification(text);
    notifications.push(notification);
}

//check if permission to show notification is granted
function checkPermission() {
    if (Notification.permission === "granted") {
        return true;
    } else {
        return false;
    }
}

function disconnectNotification() {
    if (checkPermission()) {
        newNotification("You have been disconnected from the chat!");
    }
}

function closeAllNotifications() {
    if(notifications.length > 0){
        notifications.forEach(closeNotification);
    }
}

function closeNotification(item){
    item.close();
}