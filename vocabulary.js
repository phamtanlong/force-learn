
var KEY_PROFILE = 'KEY_PROFILE';
var PROFILE = {
	last_time : 0,
	current_lesson : ''
}

var SEPERATE = '\t';
var LIST_TITLE = "LIST_TITLE";
var NONE_TITLE = "Create New Lesson";

var btn_import;
var btn_swap;
var btn_delete;
var btn_clear;
var field_content;
var field_title;
var field_current;
var field_game_type;

function parseData (allText) {
    var record_num = 2;
    var allTextLines = allText.split(/\r\n|\n/);
    var lines = [];

    for (var i = 0; i < allTextLines.length; i++) {
    	var entries = allTextLines[i].split(SEPERATE);
    	lines.push (entries);
    };

    return lines;
}

function importLesson (e) {
	var title = '' + field_title.value;
	var lessonWord = '' + field_content.value;
	var gameType = field_game_type.value;


	if (!title || title.length < 5 || !lessonWord || lessonWord.length < 5) {
		alert ('Plz input a valid lesson! Title & Words >= 5 letters');
		return;
	}

	var storage = chrome.storage.sync;

	var lesson = {};
	lesson[title] = {
		game_type : gameType,
		content : lessonWord
	};
	
	//set current lesson
	PROFILE.current_lesson = title;
	storage.set ({'KEY_PROFILE' : PROFILE}, function () {
		console.log (JSON.stringify(PROFILE));
		console.log (' --- Save currentLesson [' + title + '] Completed: ' + title);

		storage.get(KEY_PROFILE, function (objProfile) {
			if (objProfile[KEY_PROFILE]) {
				PROFILE = objProfile[KEY_PROFILE];
				console.log (JSON.stringify (PROFILE));
			} else {
				console.log ('can not find out profile');
			}
		});
	});

	storage.set (lesson, function () {
		console.log ('Save content [' + title + '] completed');
	});

	storage.get(LIST_TITLE, function (obj) {
		var arr = [];
		if (obj[LIST_TITLE]) {
			arr = obj[LIST_TITLE];
		}

		var isNewLesson = false;
		if (arr.indexOf (title) < 0) {
			arr.push (title);
			isNewLesson = true;
		}

		storage.set ({LIST_TITLE : arr}, function () {});

		if (isNewLesson) {
			refreshListLesson ();
			field_current.selectedIndex = field_current.options.length-1;
		}

		alert ("Save Completed!");
	});
}

function deleteLesson () {
	var title = field_title.value;
	if (title) {
		if (confirm('Are you sure you want to delete this lesson?')) {
			field_title.value = "";
			field_content.value = "";
			field_current.value = NONE_TITLE;

			var storage = chrome.storage.sync;
			storage.get(LIST_TITLE, function (obj) {
				var arr = [];
				if (obj[LIST_TITLE]) {
					arr = obj[LIST_TITLE];
					//remove
					var index = arr.indexOf(title);
					arr.splice(index, 1);

					var save = {};
					save[LIST_TITLE] = arr;
					storage.set (save, function () {});
				}
				
				//set current lesson
				PROFILE.current_lesson = '';
				storage.set ({'KEY_PROFILE' : PROFILE}, function () {});

				refreshListLesson ();

				alert ('Delete completed! ' + title);
			});
		}
	}
}

function swapLesson () {
	var content = field_content.value;
	var data = parseData (content);
	var content2 = "";
	for (var i = 0; i < data.length; i++) {
		var entries = data[i];
		//console.log (JSON.stringify(entries));
		content2 += entries[1] + SEPERATE + entries[0] + "\n";
	};
	content2 = content2.trim();
	field_content.value = content2;
}

function clearAll () {
	if (confirm('Are you sure you want to clear all lesson?')) {
		var storage = chrome.storage.sync;
		
		//set current lesson
		PROFILE.current_lesson = '';
		storage.set ({'KEY_PROFILE' : PROFILE}, function () {});

	    storage.set ({LIST_TITLE : ''}, function () {
	    	refreshListLesson ();
	    	field_current.value = NONE_TITLE;
	    	field_title.value = "";
	    	field_content.value = "";
	    });
	}
}

function onChangeLesson () {
	var title = field_current.value;
	if (title == NONE_TITLE) {
		field_title.value = "";
		field_content.value = "";
		btn_import.value = "Create";
		btn_swap.style.visibility = 'hidden';
		return;
	}

	if (title) {
		btn_import.value = "Update";
		btn_swap.style.visibility = 'visible';
		
		var storage = chrome.storage.sync;

		//set current lesson
		PROFILE.current_lesson = title;
		storage.set ({'KEY_PROFILE' : PROFILE}, function () {});

		//load title, content
		storage.get(title, function (obj) {
			var lesson = obj[title];
			field_title.value = title;
			field_content.value = lesson.content;
			field_game_type.value = lesson.game_type;
		});
	}
}

function refreshListLesson (argument) {
	field_current.options.length = 0;

	var opt0 = document.createElement("option");
	opt0.text = NONE_TITLE;
	opt0.value = NONE_TITLE;
	field_current.add(opt0);

	var storage = chrome.storage.sync;
	storage.get(LIST_TITLE, function (obj) {
		if (obj[LIST_TITLE]) {
			var arr = obj[LIST_TITLE];
			for (var i = 0; i < arr.length; i++) {
				var option = document.createElement("option");
				option.text = '' + arr[i];
				option.value = '' + arr[i];
				field_current.add(option);
			};

			field_current.onchange = onChangeLesson;
			field_current.value = PROFILE.current_lesson;
			onChangeLesson ();
		}
	});
}

function initFirst () {
	btn_swap.style.visibility = 'hidden';
	
	var storage = chrome.storage.sync;
	storage.get(KEY_PROFILE, function (objProfile) {
		if (objProfile[KEY_PROFILE]) {
			PROFILE = objProfile[KEY_PROFILE];
			console.log (JSON.stringify (PROFILE));
		} else {
			console.log ('can not find out profile');
		}

		refreshListLesson ();
	});
}

$(document).ready(function() {
    console.log( "Ready!" );
	
	btn_import = document.getElementById ('btn_import');
	btn_import.onclick = importLesson;

	btn_swap = document.getElementById ('btn_swap');
	btn_swap.onclick = swapLesson;

	btn_delete = document.getElementById ('btn_delete');
	btn_delete.onclick = deleteLesson;

	btn_clear = document.getElementById ('btn_clear');
	btn_clear.onclick = clearAll;

	field_content = document.getElementById ('field_content');
	field_title = document.getElementById ('field_title');

	field_current = document.getElementById ('field_current');
	field_current.onchange = onChangeLesson;

	field_game_type = document.getElementById ('field_game_type');

	initFirst ();
});

