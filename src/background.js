chrome.extension.onRequest.addListener(function (request, sender) {
    if (request.message == "playAudio") {
        new Audio("../audio/alert.wav").play()
    }
});
