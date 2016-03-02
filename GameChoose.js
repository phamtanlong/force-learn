
var GameChoose = {
	counterQuest : 0,
	allAnswers : [],
	rightAnswer : 0,

	readQuestion : {},
	readAnswer : {},

	audioWord : {},
	audioRight : {},
	audioWrong : {},
	audioNoise : {},
	addVocabulary : '<div id="abc" style="display: block;"><style type="text/css">#abc {z-index:2147483647; width: 100%;height: 100%;opacity: 0.95;top: 0;left: 0;display: none;position: fixed;background-color: #313131;overflow: auto;}#abcform {position: absolute;left: 40%;top: 10%;margin-left: -250px;max-width: 600px;min-width: 600px;padding: 10px 50px;border: 2px solid gray;border-radius: 10px;font-family: raleway;background-color: white;}#abcquest {background-color: #FEFFED;padding: 20px 35px;margin: -10px -50px;font-size: 500%;text-align: center;border-radius: 10px 10px 0 0;}.abcsubmit {text-decoration: none;width: 100%;height: 50px;text-align: center;vertical-align: baseline;display: block;background-color: #e5ffff;color: black;border: 1px solid #00e5e6;padding: 10px 0;margin-bottom: 10px;font-size: 250%;cursor: pointer;border-radius: 5px;}</style><form id="abcform"><p id="abcquest" style="font-size:400%;">家族</p><hr><a id="submit1" class="abcsubmit" style="font-size:250%;">Answer 1</a><a id="submit2" class="abcsubmit" style="font-size:250%;">Answer 2</a><a id="submit3" class="abcsubmit" style="font-size:250%;">Answer 3</a><a id="submit4" class="abcsubmit" style="font-size:250%;">Answer 4</a><hr></form></div>',
	//'<div id="abc" style="display: block;"><style type="text/css">#abc {z-index: 2147483647;width: 100%;height: 100%;opacity: 0.95;top: 0;left: 0;display: none;position: fixed;background-color: #313131;overflow: auto;}#abcform {position: absolute;left: 40%;top: 10%;margin-left: -250px;max-width: 600px;min-width: 600px;padding: 10px 50px;border: 2px solid gray;border-radius: 10px;font-family: raleway;background-color: white;}#abcquest {background-color: #FEFFED;padding: 20px 35px;margin: -10px -50px;font-size: 500%;text-align: center;border-radius: 10px 10px 0 0;}.abcsubmit {text-decoration: none;width: 100%;height: 150px;text-align: center;vertical-align: baseline;display: block;background-color: #e5ffff;color: black;border: 1px solid #00e5e6;padding: 10px 0;margin-bottom: 10px;font-size: 400%;border-radius: 5px;}input[type="checkbox"] {-webkit-appearance:none;width:20px;height:20px;background:white;border-radius:5px;border:2px solid #0099ff;}input[type="checkbox"]:checked {background: #e64d00;}</style><div id="abcform"><p id="abcquest" style="font-size:400%;">Kazoku</p><hr></br><input type="text" id="input_answer" class="abcsubmit" style="font-size:400%;" /><label id="output_answer" style="font-size:200%;"></label></br><hr><table><tr><td><input id="checkbox-readquestion" class="checkbox-custom" name="checkbox-readquestion" type="checkbox" checked>Read Question</td>	<td><input id="checkbox-readanswer" class="checkbox-custom" name="checkbox-readanswer" type="checkbox" checked>Read Answer</td></tr></table></div></div>',
	//--- Game

	installGame : function () {
		console.log ("Game Run!");

		GameChoose.audioRight = new Audio();
		GameChoose.audioRight.src = "https://dl.dropboxusercontent.com/u/41829250/JapanseForce/sound/score.mp3";

		GameChoose.audioWrong = new Audio();
		GameChoose.audioWrong.src = "https://dl.dropboxusercontent.com/u/41829250/JapanseForce/sound/die2.mp3";

		GameChoose.audioNoise = new Audio();
		GameChoose.audioNoise.src = 'http://www.ispeech.org/p/generic/getaudio?text=勉強しましょう&voice=jpjapanesemale&speed=0&action=convert';

		$('#parent_div').append(GameChoose.addVocabulary);
		
		// GameChoose.readQuestion = document.getElementById ('checkbox-readquestion');
		// GameChoose.readAnswer = document.getElementById ('checkbox-readanswer');

		GameChoose.allAnswers[0] = document.getElementById('submit1');
		GameChoose.allAnswers[1] = document.getElementById('submit2');
		GameChoose.allAnswers[2] = document.getElementById('submit3');
		GameChoose.allAnswers[3] = document.getElementById('submit4');
		GameChoose.allAnswers[0].onclick = GameChoose.submit1;
		GameChoose.allAnswers[1].onclick = GameChoose.submit2;
		GameChoose.allAnswers[2].onclick = GameChoose.submit3;
		GameChoose.allAnswers[3].onclick = GameChoose.submit4;
		GameChoose.restartGame ();
	},

	restartGame : function () {
		GameChoose.counterQuest = 0;
		GameChoose.divShow ();
		GameChoose.nextQuest ();
	},

	nextQuest : function () {
		if (GameChoose.counterQuest >= CONFIG.num_quest) {
			GameChoose.stopGame ();
		} else {
			shuffle (LESSON_DATA);
			GameChoose.rightAnswer = Math.floor(Math.random() * 4); //0,1,2,3
			document.getElementById('abcquest').innerText = LESSON_DATA[GameChoose.rightAnswer][0];
			for (var i = 0; i < 4; i++) {
				GameChoose.allAnswers[i].innerText = LESSON_DATA[i][1];
			};

			//read question
			if (GameChoose.readQuestion.checked) {
				var audioQuestion = new Audio ();
				audioQuestion.src = 'http://www.ispeech.org/p/generic/getaudio?text=' + LESSON_DATA[GameChoose.rightAnswer][0] + '&voice=jpjapanesemale&speed=0&action=convert';
				audioQuestion.play ();
			}
			
			//read answer
			GameChoose.audioWord = new Audio();
			if (GameChoose.readAnswer.checked) {
				GameChoose.audioWord.src = 'http://www.ispeech.org/p/generic/getaudio?text=' + LESSON_DATA[GameChoose.rightAnswer][1] + '&voice=jpjapanesemale&speed=0&action=convert';
			}
			
			GameChoose.counterQuest++;
		}
	},

	stopGame : function () {
		GameChoose.divHide ();
		setTimeout (function () {
			GameChoose.restartGame ();
			GameChoose.makeNoise ();
		}, CONFIG.break_time);

		//save last learn time
		var storage = chrome.storage.sync;
		var d = new Date();
	    var n = d.getTime();

	    GameChoose.counterQuest = 0;
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
			if (GameChoose.counterQuest == 1) {
				if (CONFIG.make_noise) {
					console.log ('Make noise');
					GameChoose.audioNoise.play ();
				}
			}
		}, WAIT_BEFORE_NOISE);
	},

	stopNoise : function () {
		GameChoose.audioNoise.pause();
		GameChoose.audioNoise.currentTime = 0;
	},

	rightEffect : function () {
		if (CONFIG.read_right) {
			GameChoose.audioWord.play ();
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
					GameChoose.stopGame ();
					console.log ('Break time from other tab!');
				} else {
					GameChoose.nextQuest ();
				}
			});
		}, WAIT_NEXT_QUEST);
	},

	wrongEffect : function () {
		GameChoose.audioWrong.currentTime = 0;
		GameChoose.audioWrong.play ();
	},

	submit1 : function () {
		GameChoose.stopNoise ();
		if (GameChoose.rightAnswer == 0) {
			GameChoose.rightEffect ();
		} else {
			GameChoose.wrongEffect ();
		}
	},

	submit2 : function () {
		GameChoose.stopNoise ();
		if (GameChoose.rightAnswer == 1) {
			GameChoose.rightEffect ();
		} else {
			GameChoose.wrongEffect ();
		}
	},

	submit3 : function () {
		GameChoose.stopNoise ();
		if (GameChoose.rightAnswer == 2) {
			GameChoose.rightEffect ();
		} else {
			GameChoose.wrongEffect ();
		}
	},

	submit4 : function () {
		GameChoose.stopNoise ();
		if (GameChoose.rightAnswer == 3) {
			GameChoose.rightEffect ();
		} else {
			GameChoose.wrongEffect ();
		}
	},

	divShow : function () {
		document.getElementById("abc").style.display = "block";
	},

	divHide : function () {
	    document.getElementById("abc").style.display = "none";
	}
};
