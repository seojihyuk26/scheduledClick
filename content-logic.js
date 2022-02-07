//content script
var clickedEl = null;
var time = null;
var notifier = null;
var successNotifier = null;
let timer = null;
let logoutExtend = document.querySelector('a.btn_logout');

function injectCode(src) {
    const script = document.createElement('script');
    // This is why it works!
    script.src = src;
    script.onload = function() {
        console.log(src+" script injected");
        this.remove();
    };

    // This script runs before the <head> element is created,
    // so we add the script to <html> instead.
    (document.head || document.documentElement).appendChild(script);
}


// if(window.location.hostname == "cms.mofa.go.kr"){
    // injectCode(chrome.runtime.getURL('/closeConfirm.js'));
    // import injectingCode from '/closeConfirm.js';
    // const src = chrome.runtime.getURL('/closeConfirm.js');
    // (async () => {
        // let injectingCode = await import(src);
        // injectingCode = new injectingCode.default();
        // console.log(injectingCode)
        // injectingCode.confirmDelete();
    // })();
// }
class ChangingMethods {

    constructor(activated = true) {
        this.activated = activated;
        this.confirm = window.confirm;
    }

    confirmDelete() {
        if (this.activated) {
            injectCode(chrome.runtime.getURL('/directUpdateStts.js'));
            // injectCode(""+
            // function updateStts(_brd_id, _seq, _data_stts){
                // location.href="./updateSatus.do?brd_id="+_brd_id+"&seq="+_seq+"&data_stts="+_data_stts;	
            // }
            // +"");
        }
    }

    preventlogout(CheckingMin = 10) {
        if (this.activated) {
            let checkingms = 1000 * CheckingMin * 60;
            return setInterval(()=>{logoutExtend.click()}, checkingms);
        }else{
            return null;
        }
    }

    getUploadbrdNumAndName(clickedEl) {
        if (this.activated) {
            let anchor = clickedEl.parentElement.parentElement.querySelector("td.al").querySelector("a");
            return {Num:(new URLSearchParams(anchor.search)).get("seq"),Name:anchor.innerText};
        }else{
            return {Num:'',Name:''};
        }
    }

    getNewbrdUrl(url, brdNum) {
        if (this.activated) {
            return new Promise((resolve,reject)=>{
                chrome.runtime.sendMessage({message: "fetchMofaBrdListUrl"}, function(html) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(html, "text/html");
                    var brdListRelativeUrl = doc.querySelectorAll('li.wow.fadeIn')[1].querySelector('a').pathname.replace("/C:","").replace("list","view");
                    let brdUrl = url + brdListRelativeUrl + "?seq=" + brdNum;
                    resolve(brdUrl);
                });
            });
        }else{
            return '';
        }
    }
}

let injectingCode = new ChangingMethods();
injectingCode.confirmDelete();
injectingCode.activated = (window.location.hostname != "cms.mofa.go.kr");

async function clickDom(){
    console.log(clickedEl);
    if(injectingCode.activated){
        clickedEl.removeAttribute("onclick");
        let clonedNode = clickedEl.cloneNode(true);
        clickedEl.parentNode.replaceChild(clonedNode,clickedEl);
        clickedEl = clonedNode;
    }
    console.log(clickedEl);
    let timestampText = getFullDate(new Date());
    let urlMsg = timestampText + "에 클릭을 완료했습니다.";
    let brd = injectingCode.getUploadbrdNumAndName(clickedEl);
    console.log(brd);
    brd.Url = await injectingCode.getNewbrdUrl("https://www.mofa.go.kr",brd.Num);
    console.log(brd);
    if(injectingCode.activated) urlMsg += "\n 게시된 url은" + brd.Url;
    chrome.runtime.sendMessage({message: "Console.Log",Log:urlMsg},()=>{});
    chrome.runtime.sendMessage({message: "Console.Log",Log:"[외교부] 보도자료 - ("+brd.Name+") \n 외교부 홈페이지 게시 \n "+brd.Url},()=>{});
    
    
    chrome.runtime.sendMessage({message: "ppurio",brd:brd},()=>{
        console.log(urlMsg);
        successNotifier.success('🦊: ' + urlMsg);
        if(timer != null) clearInterval(timer);
        clickedEl.click();
    });
}

function addZero(v) {
    return (v < 10 ? v = '0' + v : v);
}

function amPmDecter(intHour){
    if(intHour>12){
        return "오후 " + (intHour-12);
    }else if(intHour == 12){
        return "점심 " + 12;
    }else if(intHour > 0){
        return "오전 " + intHour;
    }else{
        return "밤 " + 12; 
    }
}

function getFullDate(dt) {
    var days = ["일", "월", "화", "수", "목", "금", "토"];

    var w = days[dt.getDay()];
    var M = dt.getMonth()+1;
    var d = addZero(dt.getDate());
    var y = dt.getFullYear();
    var h = amPmDecter(dt.getHours());
    var m = addZero(dt.getMinutes());
    var fulldate = y + "년 " + M + "월 "+ d + "일 " +  "("+ w + "요일) " + h + "시 " + m + "분";
    return fulldate;
}

document.addEventListener("contextmenu", function(event){
    clickedEl = event.target;
    return true;
}, true);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message == "getClickedEl") {
        if (notifier === null) {
            notifier = new AWN({
                icons: {
                    enabled: false
                },
                durations: {
                    global: 10000
                },
                labels: {
                    info: "Foxy says..",
                    alert: "Foxy alerts..",
                    success: "Foxy celebrates.."
                }
            });
            successNotifier = new AWN({
                icons: {
                    enabled: false
                },
                durations: {
                    global: 20000
                },
                labels: {
                    success: "Foxy celebrates.."
                }
            });
        }

        var date = new Date();

        var modal = new tingle.modal({
            footer: true,
            stickyFooter: false,
            closeMethods: ['overlay', 'button', 'escape'],
            closeLabel: "Close",
            onOpen: function() {
                var img = document.getElementById('foxyclick-logo');
                img.src = chrome.runtime.getURL('/icon128.png');
                flatpickr(
                    document.getElementById('foxyclick-input-timer'), {
                        enableTime: true,
                        minDate: new Date().setMinutes(date.getMinutes()),
                        defaultDate: new Date().setHours(date.getHours()+1,0),
                        // defaultMinute: 0,
                        inline: true,
                        minuteIncrement: 1
                    }
                );
            },
            onClose: function() {},
            beforeClose: function() {
                document.getElementById('foxyclick-input-timer').remove();
                document.getElementById('foxyclick-logo').remove();

                return true; // close the modal
            }
        });

        // set content  
        modal.setContent('<div class="hidden-sm-down"><img src="" id="foxyclick-logo" style="float:right;"><div class="bubble" style="float:right;">예약할 시간과 날짜를 지정해 주십시오.</div></div><input type="text" id="foxyclick-input-timer" value="' + new Date().setMinutes(date.getMinutes()+1).toString() + ':00">');

        // add a button
        modal.addFooterBtn('Cancel', 'tingle-btn tingle-btn--default', function() {
            modal.close();
        });

        // add another button
        modal.addFooterBtn('Set the timer!', 'tingle-btn tingle-btn--danger', function() {
            time = document.getElementById('foxyclick-input-timer').value;
            
            if(timer == null) timer = injectingCode.preventlogout();

            let dateTarget = new Date(time);

            let dateNow = new Date();
            if (dateNow.getTime() > dateTarget.getTime()) {
                notifier.alert('🦊: 당장 클릭하겠습니다.');
                (async()=>{await clickDom()})();
            } else {
                setTimeout(async()=>{await clickDom()},
                    dateTarget.getTime() - new Date().getTime()
                );

                notifier.info('🦊: ' + getFullDate(dateTarget) + "에 클릭하겠습니다.");
                sendResponse({
                    value: clickedEl.value
                });
            }
            modal.close();
        });

        // open modal
        modal.open();

    }else if (request.message == "newInstanceTab") {
        let brd = request.brd;
        let textMessage = "[외교부] 보도자료 - \n ("+brd.Name+") \n 외교부 홈페이지 게시 \n "+brd.Url;
        console.log(textMessage);
        document.querySelector("div.send_wrap").querySelector("textarea").value = textMessage;
        document.querySelector("a.btn_addressbook").click();
        sendResponse();
    }else if (request.message == "SelectAddress") {
        let arr = ['기자_구상주','기자_외신','기자_준,비상주','대변인실','보도자료_기타'];
        document.querySelectorAll('tr').forEach(element => {
            if(element.querySelector('td.title') != null && arr.includes(element.querySelector('td.title').querySelector('a').text))
                element.querySelector('td.check').querySelector('input').click();
        });
        document.querySelector("div.btn_area").querySelectorAll('a').forEach(element => {
            if(element.text == "추가") element.click();
        });
        sendResponse();
    }

    return true;
});