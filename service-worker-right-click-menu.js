let newInstanceTab= null;
let mofabrdListUrl = '';
let MofaTab = null;
// chrome.tabs.onCreated.addListener(function(tab){
    // console.log(tab);
// });

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
                                                                chrome.tabs.sendMessage(tab.id, {message:"getClickedEl",mofabrdListUrl:mofabrdListUrl}, {
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

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(request.message);
        if(request.message === "fetchMofaBrdListUrl"){
            fetch('https://www.mofa.go.kr/www/main.do')
                .then(function (response) {
                    // When the page is loaded convert it to text
                    // console.log(response);
                    return response.text()
                })
                .then(function (html) {
                    sendResponse(html);
                });
        }else if(request.message === "Console.Log"){
            console.log(request.Log);
        }else if(request.message === "ppurio"){
            chrome.tabs.create({url:"https://www.ppurio.com/mgr/PPSmsMgr.qri?act=sms_form",active:false},(tab)=>{//
                console.log(tab);
                chrome.tabs.onUpdated.addListener((tabId, changeInfo, updatedtab) =>{
                    if(changeInfo.status == 'complete'){
                        console.log(updatedtab.url);
                        console.log((new URL(updatedtab.url)));
                        console.log((new URL(updatedtab.url)).hostname);
                        console.log((new URL(updatedtab.url)).pathname);
                        console.log((new URLSearchParams(updatedtab.url)).get("target"));
                        if(tabId == tab.id){
                            chrome.tabs.sendMessage(tab.id,{message:"newInstanceTab",brd:request.brd},function(){
                                // chrome.tabs.remove(tab.id);
                                sendResponse();
                            });
                        }else if((new URL(updatedtab.url)).hostname == "www.ppurio.com" && (new URL(updatedtab.url)).pathname == "mgr/DFAddressRecipient.qri" && (new URLSearchParams(updatedtab.url)).get("target") == "addressbook"){
                            chrome.tabs.sendMessage(tabId,{message:"SelectAddress"},function(){
                                // chrome.tabs.remove(tabId);
                                // sendResponse();
                            });
                        }
                    }
                });
            });
        }
        return true;
    }
);

chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        id: "autoclicker-right",
        title: "autoclicker: add a timer",
        contexts: ["all"]
    });
})