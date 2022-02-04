class ChangingMethods {

    constructor(activated = true) {
        this.activated = activated;
        this.confirm = window.confirm;
    }

    confirmDelete() {
        if (this.activated) {
            confirm = function () { return true; }
        }else{
            confirm = this.confirm;
        }
    }

    preventlogout(CheckingMin = 10) {
        if (this.activated) {
            let checkingms = 1000 * CheckingMin * 60;
            return setInterval(onExtend, checkingms);
        }else{
            return null;
        }
    }

    getUploadbrdNum(clickedEl) {
        if (this.activated) {
            return (new URLSearchParams(clickedEl.parent.parent.querySelector("td.al.new").querySelector("a").search)).get("seq");
        }else{
            return '';
        }
    }

    getNewbrdUrl(url, brdNum) {
        if (this.activated) {
            fetch('https://www.mofa.go.kr/www/main.do')
                .then(function (response) {
                    // When the page is loaded convert it to text
                    return response.text()
                })
                .then(function (html) {
                    // Initialize the DOM parser
                    var parser = new DOMParser();

                    // Parse the text
                    var doc = parser.parseFromString(html, "text/html");

                    // You can now even select part of that html as you would in the regular DOM 
                    // Example:
                    var brdListRelativeUrl = doc.querySelectorAll('li.wow.fadeIn')[1].querySelector('a').pathname;
                    brdUrl = url + brdListRelativeUrl + "?seq=" + brdNum;
                    console.log(brdUrl);
                })
                .catch(function (err) {
                    console.log('Failed to fetch page: ', err);
                });
            return brdUrl;
        }else{
            return '';
        }
    }
}