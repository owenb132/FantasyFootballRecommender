$(document).ready(function(){
	// Enter key listener for text input
	$('#player-input').keypress(function(e) {
     	var code = (e.keyCode ? e.keyCode : e.which);
     	if (code == 13) {
        	e.preventDefault();
        	e.stopPropagation();
        	// Send text as query
        	lookupPlayer($(this).val());
     	}
	});

	// Display the stats page from search page
	$('#more-results').click(function(){
		$('#input-page').animate({ top: '-100%' },300);
		$('#stats-page').animate({ top: '0' },300);
		$('#evaluation-page').animate({ top: '0' },300);
	});

	// Display the search page from stats page
	$('#search-button').click(function(){
		$('#input-page').animate({ top: '0'	},300);
		$('#stats-page').animate({ top: '100%' },300);
		$('#evaluation-page').animate({ top: '100%' },300);
	});

	// Applies filters to tweet list
	$('#tweet-filter input:checkbox').change(function(){
		applyFilters();
    });

	// Marks the selected tweet as incorrect
	$(document).on('click', '.incorrect-button', function(){ markIncorrect($(this).closest('.tweet')); });
	// Marks the selected tweet as correct
	$(document).on('click', '.correct-button', function(){ markCorrect($(this).closest('.tweet')); });
	// Marks the selected tweet to be ignored
	$(document).on('click', '.remove-button', function(){ ignoreTweet($(this).closest('.tweet')); });
	// Marks the selected tweet to be included
	$(document).on('click', '.add-button', function(){ includeTweet($(this).closest('.tweet')); });

	// Calculate evaluation and display the evaluations page
	$('#evaluation-button').click(function(){
		calcEval();
		$('#stats-page').animate({ left: '-100%' },300);
		$('#evaluation-page').animate({ left: '0' },300);
	});

	// Display the stats page from the evaluation page
	$('#evaluation-button-back').click(function(){
		$('#stats-page').animate({ left: '0' },300);
		$('#evaluation-page').animate({ left: '100%' },300);
	});

	// Adds the selected tweet to the training data
	$(document).on('click', '.update-button', function(){ addToTraining($(this).closest('.tweet')); });
});

// Gets tweets/classification for a player
function lookupPlayer(name){
	$('#more-results').hide();
	$('#tweet-list').empty();
	$('#tweet-filter input').prop('checked', true);
	$('#rem-check').prop('checked', false);
	resetInfo();

	// No input
	if($.trim(name) == '')
		showResult("Please Enter a Name");
	// Ajax call to flask backend service
	else{
		$('#ajax-loader').show();
		$('#result').css('opacity', 0);
		var formData = new FormData($('#player-form')[0]);
		var url = '/player';

		$.ajax({
			type:'POST',
			url: url,
			data: formData,
			contentType: false,
			processData: false,
			cache: false,
			success: function(result){
				$('#ajax-loader').hide();
				jResult = $.parseJSON(result);
				showResult(jResult.decision);
				addTweets(jResult.score, jResult.tweets)
				showMore();
			},
			error: function(data, textStatus, jqXHR){
				$('#ajax-loader').hide();
				showResult("Error. Please Try Again.")
			}
		});
	}
}

// Displays a message on the search page
function showResult(message){
	$('#result').css('opacity', 0);
	$('#result').text(message).animate({opacity:1});
}

// Displays the 'more statistics' button on the search page
function showMore(){
	$('#more-results').css('opacity', 0);
	$('#more-results').show();
	$('#more-results').animate({opacity:1});
}

// Gets the json data from the service call
function addTweets(score, tweets){
	$('#pos-num span').text(score['pos']);
	$('#neg-num span').text(score['neg']);

	$.each(tweets, function(key,value){	addToTweetList(value, key);	});

	calcPercentages();
}

// Appends a tweet to the tweet list
function addToTweetList(tweet, index){
	$('#tweet-list').append($('<div class="tweet correct included">').addClass(tweet.classification)
		.append($('<div class="tweet-index">').text(index))
		.append($('<div class="tweet-text">').text(tweet.text))
		.append($('<div class="tweet-info">')
			.append($('<div class="tweet-retweets">').text("Retweets: " + tweet.retweet_count))
			.append($('<div class="tweet-favorites">').text("Favorites: " + tweet.favorite_count))
			.append($('<div class="tweet-class">').text(tweet.classification))
			.append($('<button class="incorrect-button">').text("Switch Class"))
			.append($('<button class="remove-button">').text("Remove"))
			.append($('<button class="update-button">').text("Add to Training"))
		)
	);
}

// Applies filters to the tweet list
function applyFilters(){
	$('.tweet').show();
	unchecked = $('#tweet-filter').find('input:checkbox:not(:checked)');
    unchecked.each(function(i){
       	$('.' + $(this).val()).hide();
    });
}

// Marks tweet as incorrect
function markIncorrect(tweet){
	tweet.removeClass('correct').addClass('incorrect');
	classDiv = tweet.find('.tweet-class');
	curClass = classDiv.text();
	newClass = (curClass=='pos' ? 'neg' : 'pos')
	tweet.removeClass(curClass).addClass(newClass);
	classDiv.text(newClass);
	$('#num-incorrect span').text(parseInt($('#num-incorrect span').text()) + 1);
	$('#' + newClass + '-num span').text(parseInt($('#' + newClass + '-num span').text()) + 1);
	$('#' + curClass + '-num span').text(parseInt($('#' + curClass + '-num span').text()) - 1);
	$('#num-incorrect-' + curClass + ' span').text(parseInt($('#num-incorrect-' + curClass + ' span').text()) + 1);

	tweet.find($('.incorrect-button'))
		.removeClass('incorrect-button')
		.addClass('correct-button')
	tweet.find($('.update-button')).show();

	applyFilters();
	calcPercentages();
}

// Marks tweet as correct
function markCorrect(tweet){
	tweet.removeClass('incorrect').addClass('correct');
	classDiv = tweet.find('.tweet-class');
	curClass = classDiv.text();
	newClass = (curClass=='pos' ? 'neg' : 'pos')
	classDiv.text(newClass);
	tweet.removeClass(curClass).addClass(newClass);

	$('#num-incorrect span').text(parseInt($('#num-incorrect span').text()) - 1);
	$('#' + newClass + '-num span').text(parseInt($('#' + newClass + '-num span').text()) + 1);
	$('#' + curClass + '-num span').text(parseInt($('#' + curClass + '-num span').text()) - 1);
	$('#num-incorrect-' + newClass + ' span').text(parseInt($('#num-incorrect-' + newClass + ' span').text()) - 1);

	tweet.find($('.correct-button'))
		.removeClass('correct-button')
		.addClass('incorrect-button');

	applyFilters();
	calcPercentages();
}

// Ignores tweet from calculations
function ignoreTweet(tweet){
	tweet.removeClass('included').addClass('removed');
	classDiv = tweet.find('.tweet-class');
	curClass = classDiv.text();
	$('#num-removed span').text(parseInt($('#num-removed span').text()) + 1);
	$('#' + curClass + '-num span').text(parseInt($('#' + curClass + '-num span').text()) - 1);

	if($(this).hasClass('incorrect')){
		$('#num-incorrect span').text(parseInt($('#num-incorrect span').text()) - 1);
		originalClass = (curClass=='pos' ? 'neg' : 'pos');
		$('#num-incorrect-' + originalClass + ' span').text(parseInt($('#num-incorrect-' + originalClass + ' span').text()) - 1);
	}

	tweet.find($('.remove-button'))
		.removeClass('remove-button')
		.addClass('add-button')
		.html('Include');

	tweet.find('.incorrect-button').prop('disabled',true);
	tweet.find('.correct-button').prop('disabled',true);
	tweet.find('.update-button').prop('disabled',true);

	applyFilters();
	calcPercentages();
}

// Includes tweet from classfication
function includeTweet(tweet){
	tweet.removeClass('removed').addClass('included');
	curClass = tweet.find('.tweet-class').text();
	$('#num-removed span').text(parseInt($('#num-removed span').text()) - 1);
	$('#' + curClass + '-num span').text(parseInt($('#' + curClass + '-num span').text()) + 1);

	tweet.find($('.add-button'))
		.removeClass('add-button')
		.addClass('remove-button')
		.html('Remove');

	if($(this).hasClass('incorrect')){
		$('#num-incorrect span').text(parseInt($('#num-incorrect span').text()) + 1);
		originalClass = (curClass=='pos' ? 'neg' : 'pos');
		$('#num-incorrect-' + originalClass + ' span').text(parseInt($('#num-incorrect-' + originalClass + ' span').text()) + 1);
	}

	tweet.find('.incorrect-button').prop('disabled',false);
	tweet.find('.correct-button').prop('disabled',false);
	tweet.find('.update-button').prop('disabled',false);

	applyFilters();
	calcPercentages();
}

// Calculate percentages
function calcPercentages(){
	// Get count for each 
	total = $('#tweet-list').find('.tweet:not(.removed)').length;
	totalPos = $('#tweet-list').find('.pos:not(.removed)').length;
	totalNeg = $('#tweet-list').find('.neg:not(.removed)').length;
	totalCorrect = $('#tweet-list').find('.correct:not(.removed)').length;
	totalPosCorrect = $('#tweet-list').find('.pos.correct:not(.removed):not(.incorrect)').length;
	totalNegCorrect = $('#tweet-list').find('.neg.correct:not(.removed):not(.incorrect)').length;
	// Get percentages for class
	posPercent = (total!=0) ? (totalPos/total*100) : 0;
	negPercent = (total!=0) ? (totalNeg/total*100) : 0;
	$('#pos-percent').text('%'+posPercent.toFixed(2));
	$('#neg-percent').text('%'+negPercent.toFixed(2));
	// Get number of incorrect
	totalIncorrect = $('#tweet-list').find('.incorrect:not(.removed)').length;
	totalPosIncorrect = $('#tweet-list').find('.pos.incorrect:not(.removed)').length;
	totalNegIncorrect = $('#tweet-list').find('.neg.incorrect:not(.removed)').length;
	$('#num-incorrect span').text(totalIncorrect);
	$('#num-incorrect-pos span').text(totalNegIncorrect);
	$('#num-incorrect-neg span').text(totalPosIncorrect);

	/*
	initTotalPos =  totalPosCorrect + totalNegIncorrect;
	initTotalNeg = totalNegCorrect + totalPosIncorrect;
	correct = (total!=0) ? (totalCorrect/total*100) : 0;
	posCorrect = (totalPos!=0) ? (totalPosCorrect/initTotalPos*100) : 0;
	negCorrect = (totalNeg!=0) ? (totalNegCorrect/initTotalNeg*100) : 0;
	$('#perc-correct span').text('%'+correct.toFixed(1));
	$('#perc-correct-pos span').text('%'+posCorrect.toFixed(1));
	$('#perc-correct-neg span').text('%'+negCorrect.toFixed(1));
	*/
}

// Calculate classifier evaluations
function calcEval(){
	// Get tp, tn, fp, fn values for confusion matrix
	tp = $('#tweet-list').find('.pos.correct:not(.removed):not(.incorrect)').length;
	tn = $('#tweet-list').find('.neg.correct:not(.removed):not(.incorrect)').length;
	fp = $('#tweet-list').find('.neg.incorrect:not(.removed)').length;
	fn = $('#tweet-list').find('.pos.incorrect:not(.removed)').length;
	$('#tp span').text(tp);
	$('#fn span').text(fn);
	$('#fp span').text(fp);
	$('#tn span').text(tn);
	// Precision, Recall, FMeasure for positive class
	pP = (tp != 0) ? tp/(tp+fp) : 0;
	pR = (tp != 0) ? tp/(tp+fn) : 0;
	pF = (pP+pR != 0) ? (2*pP*pR)/(pP+pR) : 0;
	$('#pos-precision span').text(pP.toFixed(2));
	$('#pos-recall span').text(pR.toFixed(2));
	$('#pos-fmeasure span').text(pF.toFixed(2));
	// Precision, Recall, FMeasure for negative class
	nP = (tn != 0) ? tn/(tn+fn) : 0;
	nR = (tn != 0) ? tn/(tn+fp) : 0;
	nF = (nP+nR != 0) ? (2*nP*nR)/(nP+nR) : 0;
	$('#neg-precision span').text(nP.toFixed(2));
	$('#neg-recall span').text(nR.toFixed(2));
	$('#neg-fmeasure span').text(nF.toFixed(2));
}

// Clears all data fields
function resetInfo(){
	$('#pos-num span').text(0);
	$('#neg-num span').text(0);
	$('#pos-percent').text("%0.00");
	$('#neg-percent').text("%0.00");
	$('#num-incorrect span').text(0);
	$('#num-incorrect-pos span').text(0);
	$('#num-incorrect-neg span').text(0);
	$('#num-removed span').text(0);
}

// Adds the tweet to a training review file
function addToTraining(tweet){
	text = tweet.find('.tweet-text').text();
	classification = tweet.find('.tweet-class').text();
	$('#training-text').val(text);
	$('#training-class').val(classification);
	
	var formData = new FormData($('#training-form')[0]);
	var url = '/training';

	$.ajax({
		type:'POST',
		url: url,
		data: formData,
		contentType: false,
		processData: false,
		cache: false,
		success: function(result){
			tweet.find('.update-button').hide();
			alert('Tweet was successfully added to training data');
		},
		error: function(data, textStatus, jqXHR){
			alert('Error. Try again later');
		}
	});
}
