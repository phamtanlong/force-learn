
var GameTyping = {
	counterQuest : 0,
	counterWrongTime : 0,
	MAX_COUNTER_WRONG : 2,
	questTitle : {},
	input_answer : {},
	output_answer : {},
	rightAnswer : '',
	audioWord : {},
	audioRight : {},
	audioWrong : {},
	audioNoise : {},
	addVocabulary : '<div id="abc" style="display: block;"><style type="text/css">#abc {z-index: 2147483647;width: 100%;height: 100%;opacity: 0.95;top: 0;left: 0;display: none;position: fixed;background-color: #313131;overflow: auto;}#abcform {position: absolute;left: 40%;top: 10%;margin-left: -250px;max-width: 600px;min-width: 600px;padding: 10px 50px;border: 2px solid gray;border-radius: 10px;font-family: raleway;background-color: white;}#abcquest {background-color: #FEFFED;padding: 20px 35px;margin: -10px -50px;font-size: 500%;text-align: center;border-radius: 10px 10px 0 0;}.abcsubmit {text-decoration: none;width: 100%;height: 150px;text-align: center;vertical-align: baseline;display: block;background-color: #e5ffff;color: black;border: 1px solid #00e5e6;padding: 10px 0;margin-bottom: 10px;font-size: 400%;border-radius: 5px;}</style><div id="abcform"><p id="abcquest" style="font-size:400%;">家族</p><hr></br><input type="text" id="input_answer" class="abcsubmit" style="font-size:400%;"/><label id="output_answer" style="font-size:200%;"></label></br><hr></div></div>',

	//--- Game

	installGame : function () {
		console.log ("Game Run!");

		GameTyping.audioRight = new Audio();
		GameTyping.audioRight.src = "https://dl.dropboxusercontent.com/u/41829250/JapanseForce/sound/score.mp3";

		GameTyping.audioWrong = new Audio();
		GameTyping.audioWrong.src = "https://dl.dropboxusercontent.com/u/41829250/JapanseForce/sound/die2.mp3";

		GameTyping.audioNoise = new Audio();
		GameTyping.audioNoise.src = 'http://www.ispeech.org/p/generic/getaudio?text=勉強しましょう&voice=jpjapanesemale&speed=0&action=convert';

		$('#parent_div').append(GameTyping.addVocabulary);
		$('form,input,select,textarea').attr("autocomplete", "off");

		GameTyping.questTitle = document.getElementById('abcquest');
		GameTyping.input_answer = document.getElementById('input_answer');
		GameTyping.output_answer = document.getElementById('output_answer');

		GameTyping.input_answer.onkeypress = function (e) {
			var code = (e.keyCode ? e.keyCode : e.which);
			if(code == 13) {
			 	GameTyping.submit ();
			}
		};

		GameTyping.restartGame ();
	},

	restartGame : function () {
		GameTyping.counterQuest = 0;
		GameTyping.counterWrongTime = 0;
		GameTyping.divShow ();
		GameTyping.nextQuest ();
	},

	nextQuest : function () {
		if (GameTyping.counterQuest >= CONFIG.num_quest) {
			GameTyping.stopGame ();
		} else {
			shuffle (LESSON_DATA);
			var key = LESSON_DATA[0][0].trim();
			var value = LESSON_DATA[0][1].trim();
			GameTyping.rightAnswer = value;
			GameTyping.questTitle.innerText = key;
			GameTyping.output_answer.innerText = '';
			GameTyping.input_answer.value = '';
			GameTyping.input_answer.focus ();
			GameTyping.audioWord = new Audio();
			GameTyping.audioWord.src = 'http://www.ispeech.org/p/generic/getaudio?text=' + key + '&voice=jpjapanesemale&speed=0&action=convert';
			
			GameTyping.counterQuest++;
			GameTyping.counterWrongTime = 0;
		}
	},

	stopGame : function () {
		GameTyping.divHide ();
		setTimeout (function () {
			GameTyping.restartGame ();
			GameTyping.makeNoise ();
		}, CONFIG.break_time);

		//save last learn time
		var storage = chrome.storage.sync;
		var d = new Date();
	    var n = d.getTime();

	    GameTyping.counterQuest = 0;
	    PROFILE.last_time = n;
	    storage.set({'KEY_PROFILE' : PROFILE}, function () {});
	},

	//--- Effect 

	makeNoise : function () {
		if (CONFIG.make_noise) {
			var audio = new Audio();
			audio.src = 'http://www.ispeech.org/p/generic/getaudio?text=勉強しましょう&voice=jpjapanesemale&speed=0&action=convert';
			audio.play ();
		}

		setTimeout (function () {
			if (GameTyping.counterQuest == 1) {
				if (CONFIG.make_noise) {
					console.log ('Make noise');
					GameTyping.audioNoise.play ();
				}
			}
		}, WAIT_BEFORE_NOISE);
	},

	stopNoise : function () {
		GameTyping.audioNoise.pause();
		GameTyping.audioNoise.currentTime = 0;
	},

	rightEffect : function () {
		if (CONFIG.read_right) {
			GameTyping.audioWord.play ();
		}
		
		setTimeout (function () {
			var storage = chrome.storage.sync;
			storage.get (KEY_PROFILE, function (objProfile) {
				if (objProfile[KEY_PROFILE]) {
					PROFILE = objProfile[KEY_PROFILE];
				}
				var nowDate = new Date ();
				var nowTime = nowDate.getTime ();
				var delta = nowTime - PROFILE.last_time;
				if (delta <= CONFIG.break_time) {
					GameTyping.stopGame ();
					console.log ('Break time from other tab!');
				} else {
					GameTyping.nextQuest ();
				}
			});
		}, WAIT_NEXT_QUEST);
	},

	wrongEffect : function () {
		GameTyping.audioWrong.currentTime = 0;
		GameTyping.audioWrong.play ();
		GameTyping.counterWrongTime++;
		if (GameTyping.counterWrongTime >= GameTyping.MAX_COUNTER_WRONG) {
			GameTyping.output_answer.innerText = GameTyping.rightAnswer;
		}
	},

	submit : function () {
		GameTyping.stopNoise ();
		var key = GameTyping.rightAnswer.toLowerCase ().trim();
		var value = GameTyping.input_answer.value.toLowerCase ().trim();

		//remove non-character, non-number (,.-;''=+〜)
		key = key.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/gi, '');
		value = value.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/gi, '');

		//bo dau tieng viet
		if (CONFIG.remove_vietnam_sign) {
			key = bodauTiengViet (key);
			value = bodauTiengViet (value);
		}

		if (key.localeCompare (value) == 0) {
			GameTyping.rightEffect ();
			GameTyping.output_answer.innerText = GameTyping.rightAnswer;
		} else {
			GameTyping.wrongEffect ();
		}
	},

	divShow : function () {
		document.getElementById("abc").style.display = "block";
	},

	divHide : function () {
	    document.getElementById("abc").style.display = "none";
	}
};
