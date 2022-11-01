console.log(new Date());
chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.action == "onExtLoad") {
        console.log(new Date());
    }
});