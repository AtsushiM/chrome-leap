var connected = false, // Boolean: { false: disconnected, true: connected }
    gestureState = {
        'swipe': 0,
        'circle': 0,
        'keyTap': 0
    },  // Number: { 0: none, 1: start, 2: progress }
    leap = null;       // Leap.Controller instance

chrome.browserAction.onClicked.addListener(function() {
    connected = !connected; // toggle state

    if (connected) {
      //Leap.loop({ enableGestures: true }, onframe);
        leap = new Leap.Controller({
                  //host: "127.0.0.1",
                  //port: 6437,
                    enableGestures: true,
                  //frameEventName: "animationFrame"
                });
        leap.loop(onframe);
    } else {
        // TODO: disconnect impl
        leap.disconnect();
    }
    chrome.browserAction.setBadgeText({ text: connected ? "on" : "off" });
});

function onframe(frame) {
    if (!connected) {
        return;
    }
    var i = 0, iz = frame.gestures.length, gesture, type;

    for (; i < iz; ++i) {
        gesture = frame.gestures[i];
        type = gesture.type;

        switch (type) {
            case 'circle':
            case 'keyTap':
            case 'swipe':
                switch (gesture.state) {
                    case "start":
                        if (gestureState[type] === 0) { // avoid chattering
                            gestureState[type] = 1;
                        }
                        break;
                    case "update":
                        if (gestureState[type] === 1) { // avoid chattering
                            gestureState[type] = 2;
                        }
                        break;
                    case "stop":
                        if (gestureState[type] === 2) { // avoid chattering
                            gestureState[type] = 0;

                            actionGesture(gesture, frame);
                        }
                        break;
                }

                break;
        }
    }
}

var surrogate_id;
function actionSurrogate(func) {
    clearTimeout(surrogate_id);
    surrogate_id = setTimeout(func, 100);
}

function actionGesture(gesture, frame) {
    switch (gesture.type) {
        case 'circle':
            actionSurrogate(function() {
                executeScript("location.reload(true)");
            });
            break;
        case 'keyTap':
            actionSurrogate(function() {
                executeScript("alert('key tap')");
            });
            break;
        case 'swipe':
            if (gesture.direction[0] < 0) {
                actionSurrogate(function() {
                    executeScript("history.back()");
                });
            }
            else {
                actionSurrogate(function() {
                    executeScript("history.forward()");
                });
            }
            break;
    }
}

function executeScript(code) {
    chrome.tabs.executeScript(null, {
        code: code
    });
}

