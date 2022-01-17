let tab= null;

chrome.tabs.onCreated.addListener(function(tab){
    console.log(tab);
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId == "autoclicker-right") {
        chrome.scripting.executeScript({
                target: {
                    tabId: tab.id
                },
                files: ['content-ext-awn.js']
            },
            (injectionResults1) => {
                chrome.scripting.executeScript({
                        target: {
                            tabId: tab.id
                        },
                        files: ['content-ext-tingle.js']
                    },
                    (injectionResults3) => {
                        chrome.scripting.executeScript({
                                target: {
                                    tabId: tab.id
                                },
                                files: ['content-ext-timepicker.js']
                            },
                            (injectionResults4) => {
                                chrome.scripting.executeScript({
                                        target: {
                                            tabId: tab.id
                                        },
                                        files: ['content-worker.js']
                                    },
                                    (injectionResults5) => {
                                        chrome.scripting.insertCSS({
                                                target: {
                                                    tabId: tab.id
                                                },
                                                files: ['content-ext-awn.css']
                                            },
                                            (injectionResults6) => {
                                                chrome.scripting.insertCSS({
                                                        target: {
                                                            tabId: tab.id
                                                        },
                                                        files: ['content-ext-tingle.css']
                                                    },
                                                    (injectionResults7) => {
                                                        chrome.scripting.insertCSS({
                                                                target: {
                                                                    tabId: tab.id
                                                                },
                                                                files: ['content-ext-timepicker.css']
                                                            },
                                                            (injectionResults8) => {
                                                                (async()=>{tab = await chrome.tabs.query({})})();
                                                                chrome.tabs.sendMessage(tab.id, "getClickedEl", {
                                                                    frameId: info.frameId
                                                                }, data => {});
                                                            });
                                                    });
                                            });
                                    });
                            });
                    });
            });
    }
});

chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        id: "autoclicker-right",
        title: "autoclicker: add a timer",
        contexts: ["all"]
    });
})