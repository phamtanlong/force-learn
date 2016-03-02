
var KEY_BLACKLIST = 'KEY_BLACKLIST';
var KEY_STOP1MIN = 'KEY_STOP1MIN';
var TIME_STOP = 60; //seconds

function clickVocabulary(e) {
    chrome.tabs.create({
        url: "vocabulary.html"
    });
    window.close();
}

function clickOptions(e) {
    chrome.tabs.create({
        url: "options.html"
    });
    window.close();
}

function clickVisitUs(e) {
    chrome.tabs.create({
        url: "https://www.facebook.com/jundat.longpham"
    });
    window.close();
}

function clickExtension(e) {
    chrome.tabs.create({
        url: "chrome://extensions"
    });
    window.close();
}

function clickStop1Min (e) {
    var storage = chrome.storage.sync;
    storage.get (KEY_STOP1MIN, function (obj) {
        var stopFrom = 0;
        if (obj[KEY_STOP1MIN]) {
            stopFrom = obj[KEY_STOP1MIN];
        }

        var nowDate = new Date ();
        var nowTime = nowDate.getTime ();
        console.log (nowTime);

        if (nowTime - stopFrom > 1000 * TIME_STOP) {
            e.target.style.background = "#e60000";
            e.target.innerText = 'Continue!';
            storage.set ({'KEY_STOP1MIN' : nowTime}, function () {});
        } else {
            e.target.style.background = "#ffff80";
            e.target.innerText = 'Stop1Min!';
            storage.set ({'KEY_STOP1MIN' : 0}, function () {});
        }
    });
    window.close();
}

function clickAddBackList (e) {
    chrome.tabs.getSelected(null, function(tab) {
        var l = document.createElement("a");
        l.href = tab.url;
        var host = l.hostname;

        var storage = chrome.storage.sync;
        storage.get (KEY_BLACKLIST, function (objBlackList) {
            var list = DefaultBlackList;
            if (objBlackList[KEY_BLACKLIST]) {
                list = objBlackList[KEY_BLACKLIST];
            }

            if (list.indexOf (host) == -1) {
                list.push (host);
                storage.set ({'KEY_BLACKLIST' : list}, function () {
                    console.log ('save black list ok');
                });
            }
        });
    });
    window.close();
}

document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('btnVocabulary').onclick = clickVocabulary;
    document.getElementById('btnOptions').onclick = clickOptions;
    document.getElementById('btnVisitUs').onclick = clickVisitUs;
    document.getElementById('btnExtension').onclick = clickExtension;
    document.getElementById('btnStop1Min').onclick = clickStop1Min;
    document.getElementById('btnBlackList').onclick = clickAddBackList;
    

    var storage = chrome.storage.sync;
    storage.get (KEY_STOP1MIN, function (obj) {
        target = document.getElementById('btnStop1Min');

        var stopFrom = 0;
        if (obj[KEY_STOP1MIN]) {
            stopFrom = obj[KEY_STOP1MIN];
        }

        var nowDate = new Date ();
        var nowTime = nowDate.getTime ();
        if (nowTime - stopFrom > 1000 * TIME_STOP) {
            target.style.background = "#ffff80";
            target.innerText = 'Stop1Min!';
        } else {
            target.style.background = "#e60000";
            target.innerText = 'Continue!';
        }
    });
});