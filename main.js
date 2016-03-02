
var TIME_STOP = 60;
var SEPERATE = '\t';
var LIST_TITLE = "LIST_TITLE";
var KEY_STOP1MIN = 'KEY_STOP1MIN';

var KEY_BLACKLIST = 'KEY_BLACKLIST';
var KEY_CONFIG = 'KEY_CONFIG';
var KEY_PROFILE = 'KEY_PROFILE';
var CONFIG = {
	num_quest : 5,
	break_time : 2 * 1000 * 60,
	read_right : true,
	make_noise : true,
	remove_vietnam_sign : true,
};
var PROFILE = {
	last_time : 0,
	current_lesson : ''
};
var BLACKLIST = DefaultBlackList;

var WAIT_BEFORE_NOISE = 10000;
var WAIT_NEXT_QUEST = 1000;
var LESSON_DATA = {};
var IS_RUN = true;

var parentDiv = {};

//--- Utils 

function bodauTiengViet(str) {  
	str= str.toLowerCase();  
	str= str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");  
	str= str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");  
	str= str.replace(/ì|í|ị|ỉ|ĩ/g,"i");  
	str= str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o");  
	str= str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");  
	str= str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");  
	str= str.replace(/đ/g,"d");  
	return str;
}

function bodauCau(str) {  
	str= str.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/gi, '');
	return str;
}

function isEmpty (obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
};

function shuffle (o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function parseData (allText) {
    var record_num = 2;
    var allTextLines = allText.split(/\r\n|\n/);
    var lines = [];
    for (var i = 0; i < allTextLines.length; i++) {
    	var entries = allTextLines[i].split(SEPERATE);
    	lines.push (entries);
    };
    return lines;
};

function checkRun () {
	//check time
	var storage = chrome.storage.sync;
	storage.get (KEY_PROFILE, function (obj) {
		var nowDate = new Date ();
		var nowTime = nowDate.getTime ();
		if (obj[KEY_PROFILE]) {
			PROFILE = obj[KEY_PROFILE];
		}
		var lastTime = PROFILE.last_time;
		var delta = nowTime - lastTime; //millisecond
		var canStart = true;
		if (delta < CONFIG.break_time) {
			canStart = false;
			console.log ("In Rest Time, Wait: " + ((CONFIG.break_time-delta)/1000) + 's');
		}

		storage.get (KEY_BLACKLIST, function (objBlackList) {
			if (objBlackList[KEY_BLACKLIST]) {
				BLACKLIST = objBlackList[KEY_BLACKLIST];
			} else {
				console.log ('default back list');
			}
			console.log (JSON.stringify (BLACKLIST));

			for (var i = BLACKLIST.length - 1; i >= 0; i--) {
				if (BLACKLIST[i].indexOf (location.hostname) > -1 || location.hostname.indexOf (BLACKLIST[i]) > -1) {
					if (canStart) {
						loadData ();
					} else {
						setTimeout (function () {
							loadData ();
						}, CONFIG.break_time - delta);
					}
					break;
				}
			};
		});
	});
};


function loadConfig () {
	var storage = chrome.storage.sync;
	storage.get (KEY_CONFIG, function (obj) {
		if (obj[KEY_CONFIG]) {
			CONFIG = obj[KEY_CONFIG];
			console.log (JSON.stringify (CONFIG));
		}
		checkRun ();
	});
};

function loadData () {
	var storage = chrome.storage.sync;
	storage.get(KEY_PROFILE, function (objProfile) {
		if (objProfile[KEY_PROFILE]) {
			PROFILE = objProfile[KEY_PROFILE];
			console.log (JSON.stringify (PROFILE));
		} else {
			console.log ('can not find out profile');
		}

		var title = PROFILE.current_lesson;
		if (title) {
			storage.get(title, function (objLesson) {
				var lesson = objLesson[title];
				if (lesson) {
					LESSON_DATA = parseData (lesson.content);
					if (lesson.game_type.localeCompare ('Choose1/4') == 0) {
						GameChoose.installGame ();
					} else {
						GameTyping.installGame ();
					}
				} else {
					console.log ('Can not load lesson: ' + title);
				}
			});
		} else {
			console.log ('Null title:' + title);
		}
	});
};

//--- Effect 

function parentDivShow () {
	if (IS_RUN) {
		parentDiv.style.display = "block";
	}
};

function parentDivHide () {
    parentDiv.style.display = "none";
};

$(document).ready(function() {
	var add = '<div id="parent_div"></div>';
	$('body').append(add);
	parentDiv = document.getElementById("parent_div");

    loadConfig ();
	
	var storage = chrome.storage.sync;

    setInterval(function(){ 
	    storage.get ('KEY_STOP1MIN', function (obj) {
	        var stopFrom = 0;
	        if (obj['KEY_STOP1MIN']) {
	            stopFrom = obj['KEY_STOP1MIN'];
	        }

	        var nowDate = new Date ();
	        var nowTime = nowDate.getTime ();

	        if (nowTime - stopFrom > 1000 * TIME_STOP) {
	           	IS_RUN = true;
	           	if (GameTyping.counterQuest != 0 || GameChoose.counterQuest != 0) {
	           		parentDivShow ();
	           	}
	        } else {
	            IS_RUN = false;
	            parentDivHide ();
	        }
	    });
    }, 1000);
});


