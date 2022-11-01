
//TBD:delete form gt 5 days
chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.action == "onPopulate") {
        //console.log("onPopulate")
    }
    if (request.action == "storeData") {
        //console.log("storeData")
    }
});
chrome.runtime.sendMessage({
    action: "onExtLoad",
    source: true
});

chrome.runtime.onInstalled.addListener(function() { 
    console.log("I started up!");
    chrome.storage.local.set({"startedUp": true});
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
        files: ["assets/jquery.slim.min.js", "populateData.js"],
        target: { tabId: tabId[0]['id'] }
    }).then(results => {
        //console.log(results)

    }, err => {
        //console.log(err)

    });

}

async function storeData(e) {
    const tabId = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        files: ["storeData.js"],
        target: { tabId: tabId[0]['id'] }
    }).then(results => {
        //console.log(results)

    }, err => {
        //console.log(err)

    });

}

async function clearData() {

    const tabId = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        func: () => {
            Object.keys(localStorage).map(a => {
                if (a.startsWith("StoreForm_"))
                    localStorage.removeItem(a)
            })
        },
        target: { tabId: tabId[0]['id'] }
    }).then(results => {
    }, err => {
    });

}