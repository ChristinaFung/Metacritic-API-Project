// HackerYou Week 5 Project
// By: Christina Fung
// JS File

//TO FIND: 
// ****************************
// 1. Game Generator Functions
// 2. Event-triggered Functions
// 3. Loading Functions
// 4. Init Function
// 5. Document Ready Function

var app = {};

// 1. GAME GENERATOR FUNCTIONS
// ****************************
app.getInput = function(platformChoice){
	$('.platformButton').on('click', function() {
		app.platformChoice = $('#platform').val();
		app.getGames(app.platformChoice);
	});
};

app.getSleep = function() {
	$('.sleepButton').on('click', function() {
		app.sleepChoice = $('#sleep').val();
		// console.log(app.sleepChoice);

		if (app.sleepChoice === '1') {
			app.sleepQuote = "Don't need sleep? Perfect.";
		} else if (app.sleepChoice === '2') {
			app.sleepQuote = "Be prepared to sacrifice your precious beauty sleep!";
		} else {
			app.sleepQuote = "What is this sleep you speak of?";
		};
		// console.log(app.sleepQuote);
	});
};

app.getGames = function(platformChoice) {
	$.ajax({
		url: 'https://metacritic-2.p.mashape.com/game-list/' + platformChoice + '/all',
		type: 'GET',
		dataType: 'json',
		data: {
			order_by: 'metascore'
		},
		headers: {
			'X-Mashape-Key': 'eadzQNSIZnmshZHl8YQFZm6fKuPKp1beZtFjsn3gu1wy0pjuBa',
			'Accept': 'application/json'
		},
		success: function(games) {
			var games = games.results.slice(0,20);
			// console.log(games);
			app.getGenre(games);
		}
	});
};

app.getGenre = function(games) {
	var genreApiList = [];
	$.each(games, function(index,item) {
		genreApiList.push(
			$.ajax({
				url: 'https://metacritic-2.p.mashape.com/find/game',
				headers: {
					'X-Mashape-Key': 'eadzQNSIZnmshZHl8YQFZm6fKuPKp1beZtFjsn3gu1wy0pjuBa',
					'Accept': 'application/json'
				},
				data: {
					platform: app.platformChoice,
					title: item.name
				}
			})
		);
	});
	$.when.apply($,genreApiList).then(function(res) {
		var data = arguments;
		app.gamesBucket = [];
		app.genres = [];

		for (var i = 0; i < data.length; i++) {
			if (data[i][0].result.genre != undefined) {
				app.gamesBucket.push({
					name: data[i][0].result.name,
					genre: data[i][0].result.genre[0],
					score: data[i][0].result.score,
					summary: data[i][0].result.summary
				});	

				app.genres.push(data[i][0].result.genre[0]);
			}
		
		};

		// console.log(app.gamesBucket);
		app.populateGenres();
	});
};

app.populateGenres = function() {
	$('#genre').empty();
	var uniqueGenres = _.uniq(app.genres);
	// console.log(uniqueGenres);

	$.each(uniqueGenres, function(index,item) {
		// console.log(item);
		var option = $('<option>').val(item).text(item);
		$('#genre').append(option);
	});
	//HIDE LOADING BAR HERE. 
	$('.loadingWrapper').addClass('none');
	$('.genreWrapper').removeClass('none');


};

app.getUserGenre = function() {
	$('.genreButton').on('click', function() {
		// console.log("test!!");
		app.userGenre = $('#genre').val();
		// console.log(app.userGenre);
		app.filterGames();
	});
};

app.filterGames = function() {
	app.filteredGames = _.filter(app.gamesBucket, function(game) {
		return game.genre == app.userGenre;
	});
	
	app.gameRandomizer(app.filteredGames);
	if (app.filteredGames.length > 1) {
		$('.gimmeAnotherContainer').addClass('addSpan6').removeClass('none');
		$('.restartContainer').addClass('addSpan6');
	}

};

app.gameRandomizer = function (filteredGames){// accepts input from filterGames
	var randomIndex = Math.floor(Math.random() * filteredGames.length);
	app.recommendation = [];
	app.recommendation = filteredGames[randomIndex];
	app.displayGame(app.recommendation, app.sleepQuote);
};

app.displayGame = function(recommendation, sleepQuote) {
		$('.gameContainer').empty();
		$gameStartText = $('<h3>').text("You should play...");
		$name = $('<h3>').text(recommendation.name);
		$genre = $('<h4>').text("Genre: " + recommendation.genre);
		$summary = $('<p>').text("Game Summary: " + recommendation.summary);
		$sleep = $('<p>').text(sleepQuote);
		$('.gameContainer').append($gameStartText, $name, $genre, $summary, $sleep);
};


// 2. EVENT-TRIGGERED FUNCTIONS
// ****************************
$('.continueLink').on('click', function(e) {
	e.preventDefault();
	$('.platformWrapper').removeClass('none');
	$('.continueLink').addClass('none');
});

$('.platformButton').on('click', function(e) {
	e.preventDefault();
	$('.platformWrapper').addClass('none');
	$('.sleepWrapper').removeClass('none');
});

$('.sleepButton').on('click', function(e) {
	e.preventDefault();
	$('.platformWrapper').addClass('none');
	$('.sleepWrapper').addClass('none');
	$('.loadingWrapper').removeClass('none');
	app.loadAnimation();
});

$('.genreButton').on('click', function(e) {
	e.preventDefault();
	$('.platformWrapper').addClass('none');
	$('.sleepWrapper').addClass('none');
	$('.genreWrapper').addClass('none');
	$('.gameWrapper').removeClass('none');
	$('.restartContainer').removeClass('none');
});


// 3. LOADING FUNCTIONS
// ****************************
$('.gimmeAnother').on('click', function() {
	$(this).removeClass('hvr-pulse');
	app.gameRandomizer(app.filteredGames);
});

$('.restart').on('click', function() {
	document.location.reload(true);
});

$('.title').on('click', function(e) {
	e.preventDefault();
	document.location.reload(true);
});

app.showModal = function() {
	$(".helpButton").on("click", function() {
		$(".modalContainer").addClass("show");
	});
}

app.showCredits = function() {
	$(".creditsLink").on("click", function(e) {
		e.preventDefault;
		$(".creditsContainer").addClass("show");
	});	
}

app.closeModal = function() {
	$(".closeButton").on("click", function() {
		$(".modalContainer").removeClass("show");
	});
}

app.closeCredits = function() {
	$(".closeButton").on("click", function() {
		$(".creditsContainer").removeClass("show");
	});
}

app.loadAnimation = function() {
	$('.loadingWrapper').typed({
        strings: ["One moment please...", "Gathering minerals...", "Sweeping dust...", "Constructing pylons...", "Playing ocarina...", "Baking cakes...", "Cutting grass...", "Catching Pokemon...", "Summoning dragons...", "One moment please...", "Gathering minerals...", "Sweeping dust...", "Constructing pylons...", "Baking cakes...", "Cutting grass...", "Catching Pokemon...", "Summoning dragons..."],
        typeSpeed: 0,
        cursorChar: ' '
      });
};


// 4. INIT FUNCTION
// ****************************
app.init = function() {
	app.showModal();
	app.showCredits();
	app.closeModal();
	app.closeCredits();
	app.getInput('pc');
	app.getSleep();
	app.getUserGenre();
};


// 5. DOCUMENT READY
// ****************************
$(function() {
	app.init();
});