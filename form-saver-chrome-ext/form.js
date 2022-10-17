chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.action == "onPopulate") {
    }
    if (request.action == "storeData") {
    }
});

document.getElementById('populate').addEventListener('click', function () {
    populateData();
});
document.getElementById('store').addEventListener('click', function () {
    storeData();
});
document.getElementById('clear').addEventListener('click', function () {
    clearData();
});
async function populateData(e) {

    const tabId = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        files: ["jquery.slim.min.js", "populateData.js"],
        target: { tabId: tabId[0]['id'] }
    }).then(results => {
    }, err => {
    });

}

async function storeData(e) {
    const tabId = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        files: ["jquery.slim.min.js", "storeData.js"],
        target: { tabId: tabId[0]['id'] }
    }).then(results => {
    }, err => {
    });

}

async function clearData() {

    const tabId = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        func:()=>{localStorage.clear()},
        target: { tabId: tabId[0]['id'] }
    }).then(results => {
    }, err => {
    });

}