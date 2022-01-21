//content script
var clickedEl = null;
var time = null;
var notifier = null;
let timer = null;

function injectCode(src) {
    const script = document.createElement('script');
    // This is why it works!
    script.src = src;
    script.onload = function() {
        console.log("script injected");
        this.remove();
    };

    // This script runs before the <head> element is created,
    // so we add the script to <html> instead.
    (document.head || document.documentElement).appendChild(script);
}

if(window.location.hostname == "cms.mofa.go.kr"){
    injectCode(chrome.runtime.getURL('/closeConfirm.js'));
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
    if (request == "getClickedEl") {
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
                        minDate: new Date().setMinutes(date.getMinutes()+1),
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
            
            if(timer == null) timer = preventlogout();

            let dateTarget = new Date(time);

            let dateNow = new Date();
            if (dateNow.getTime() > dateTarget.getTime()) {
                notifier.alert('🦊: your time is in the past. Select a time in the future.');
            } else {

                var worker = new Worker(URL.createObjectURL(new Blob(["(" + foxyclick_worker_function.toString() + ")()"], {
                    type: 'text/javascript'
                })));
                worker.postMessage([dateTarget]);

                worker.onmessage = function(e) {
                    clickedEl.click();
                    let timestampText = getFullDate(new Date());
                    console.log(timestampText + " 에 클릭을 완료했습니다.");
                    notifier.success('🦊: ' + timestampText + "에 클릭을 완료했습니다.");
                    let brdNum = getUploadbrdNum(clickedEl);
                    let brdUrl = getNewbrdUrl("https://www.mofa.go.kr",brdNum);
                    console.log(clickedEl);
                    console.log(brdNum);
                    console.log(brdUrl);
                    if(timer != null) clearInterval(timer);
                }

                notifier.info('🦊: ' + getFullDate(dateTarget) + "에 클릭하겠습니다.");
                sendResponse({
                    value: clickedEl.value
                });
            }
            modal.close();
        });

        // open modal
        modal.open();

    }

    return true;
});