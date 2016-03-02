
var KEY_BLACKLIST = 'KEY_BLACKLIST';
var KEY_CONFIG = 'KEY_CONFIG';
var DEFAULT_CONFIG = {
	num_quest : 5,
	break_time : 2 * 1000 * 60,
	read_right : true,
	make_noise : true,
	remove_vietnam_sign : true,
}

var num_quest;
var break_time;
var read_right;
var make_noise;
var remove_vietnam_sign;
var black_list;
var btn_save;

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

function changeNumQuest () {
	if (num_quest.value < 0) {
		num_quest.value = 0;
	}
}

function changeBreakTime () {
	if (break_time.value < 0) {
		break_time.value = 0;
	}
}

function onSave () {
	var config = {
		num_quest : parseInt(num_quest.value),
		break_time : 60 * 1000 * parseInt(break_time.value),
		read_right : read_right.checked,
		make_noise : make_noise.checked,
		remove_vietnam_sign : remove_vietnam_sign.checked
	}

	saveKeyValue (KEY_CONFIG, config);

	var list = document.getElementsByClassName ('black_page');
	var listKeepPage = [];
	for (var i = 0; i < list.length; i++) {
		var page = list[i];
		if (page.checked) {
			listKeepPage.push (page.id);
		}
	};
	saveKeyValue (KEY_BLACKLIST, listKeepPage, function () {
		initFirst ();
	});

	alert ('Save completed!');
}

function saveKeyValue (key, value, callback) {
	var storage = chrome.storage.sync;
	var obj = {};
	obj[key] = value;
	storage.set (obj, function () {
		if (callback) {
			callback ();
		}
	});
}

function initFirst () {
	var storage = chrome.storage.sync;
	storage.get (KEY_CONFIG, function (obj) {
		var config = obj[KEY_CONFIG];
		if (!config) {
			config = DEFAULT_CONFIG;
		}

		//init element
		num_quest.value = config.num_quest;
		break_time.value = config.break_time / 1000 / 60;
		read_right.checked = config.read_right;
		make_noise.checked = config.make_noise;
		remove_vietnam_sign.checked = config.remove_vietnam_sign;
	});

	storage.get (KEY_BLACKLIST, function (obj) {
		var list = DefaultBlackList; //default page
		if (obj[KEY_BLACKLIST]) {
			list = obj[KEY_BLACKLIST];
		}

		//remove
		while (black_list.firstChild) {
		    black_list.removeChild(black_list.firstChild);
		}

		for (var i = 0; i < list.length; i++) {
			$('#black_list').append('<input class="black_page" checked type="checkbox" id="' + list[i] + '" />' + list[i] + '<br/>');
		};
	});
}

$(document).ready(function() {
    console.log( "Ready!" );

	num_quest = document.getElementById ('num_quest');
	num_quest.onchange = changeNumQuest;
	num_quest.onkeydown = function (evt) {
		var charCode = (evt.which) ? evt.which : event.keyCode

	    if (evt.target.value.length >= 4) {
	    	if (charCode != 8) {
	    		return false;
	    	}
	    }
		
	    if (charCode > 31 && (charCode < 48 || charCode > 57))
	        return false;
	    return true;
	};

	break_time = document.getElementById ('break_time');
	break_time.onchange = changeBreakTime;
	break_time.onkeydown = function (evt) {
		var charCode = (evt.which) ? evt.which : event.keyCode

	    if (evt.target.value.length >= 4) {
	    	if (charCode != 8) {
	    		return false;
	    	}
	    }
	    
	    if (charCode > 31 && (charCode < 48 || charCode > 57))
	        return false;

	    return true;
	};

	read_right = document.getElementById ('checkbox-read');
	make_noise = document.getElementById ('checkbox-noise');
	remove_vietnam_sign = document.getElementById ('checkbox-vietnam-sign');
	black_list = document.getElementById ('black_list');

	btn_save = document.getElementById ('btn_save');
	btn_save.onclick = onSave;

	initFirst ();
});