function foxyclick_worker_function() {

    function msToTime(ms) {
        let seconds = (ms / 1000).toFixed(1);
        let minutes = (ms / (1000 * 60)).toFixed(1);
        let hours = (ms / (1000 * 60 * 60)).toFixed(1);
        let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
        if (seconds < 60) return seconds + " sec";
        else if (minutes < 60) return minutes + " min";
        else if (hours < 24) return hours + " hrs";
        else return days + " Days"
    }

    function timerLogic(dateTarget) {

        if ((dateTarget.getTime() - new Date().getTime()) > 300000) // over 5 mins 
        {
            let tenSecsToClick = (dateTarget.getTime() - 120000) - new Date().getTime();
            let debug = 'Handy auto click: Waiting! Back in ' + msToTime(tenSecsToClick) + ', when it is 2 mins to the click.';
            setTimeout(function() {
                timerLogic(dateTarget)
            }, tenSecsToClick);
            return;
        }

        let debug = 'Handy auto click: going to click after ' + msToTime(dateTarget.getTime() - new Date().getTime()) + '.';
        setTimeout(
            function() {
                postMessage('workerResult');
            },
            dateTarget.getTime() - new Date().getTime()
        );
    }

    self.onmessage = function(e) {
        timerLogic(e.data[0]);
    }

}
// This is in case of normal worker start
// "window" is not defined in web worker
// so if you load this file directly using `new Worker`
// the worker code will still execute properly
if (window != self)
    foxyclick_worker_function();