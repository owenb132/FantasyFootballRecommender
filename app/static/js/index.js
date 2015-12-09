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

	$('#more-results').click(function(){
		$('#input-page').animate({
			top: '-100%'
		},300);
		$('#stats-page').animate({
			top: '0'
		},300);
	});

	$('#search-button').click(function(){
		$('#input-page').animate({
			top: '0'
		},300);
		$('#stats-page').animate({
			top: '100%'
		},300);
	});

	$('#tweet-filter input:checkbox').change(function(){
		applyFilters();
    });

	$(document).on('click', '.incorrect-button', function(){
		markIncorrect($(this).closest('.tweet'));
	});

	$(document).on('click', '.correct-button', function(){
		markCorrect($(this).closest('.tweet'));
	});

	$(document).on('click', '.remove-button', function(){
		ignoreTweet($(this).closest('.tweet'));
	});

	$(document).on('click', '.add-button', function(){
		includeTweet($(this).closest('.tweet'));
	});
});

function lookupPlayer(name){
	$('#more-results').hide();
	$('#tweet-list').empty();
	$('#tweet-filter input').prop('checked', true);
	$('#rem-check').prop('checked', false);

	if($.trim(name) == '')
		showResult("Please Enter a Name");
	
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

function showResult(message){
	$('#result').css('opacity', 0);
	$('#result').text(message).animate({opacity:1});
}

function showMore(){
	$('#more-results').css('opacity', 0);
	$('#more-results').show();
	$('#more-results').animate({opacity:1});
}

function addTweets(score, tweets){
	$('#pos-num span').text(score['pos']);
	$('#neg-num span').text(score['neg']);

	$.each(tweets, function(key,value){
		addToTweetList(value, key);
	});
}

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
		)
	);
}

function applyFilters(){
	$('.tweet').show();
	unchecked = $('#tweet-filter').find('input:checkbox:not(:checked)');
    unchecked.each(function(i){
       	$('.' + $(this).val()).hide();
    });
}

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

	applyFilters();
}

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
}

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
		.text('Included');

	tweet.find('.incorrect-button').prop('disabled',true);
	tweet.find('.correct-button').prop('disabled',true);

	applyFilters();
}

function includeTweet(tweet){
	tweet.removeClass('removed').addClass('included');
	curClass = tweet.find('.tweet-class').text();
	$('#num-removed span').text(parseInt($('#num-removed span').text()) - 1);
	$('#' + curClass + '-num span').text(parseInt($('#' + curClass + '-num span').text()) + 1);

	tweet.find($('.add-button'))
		.removeClass('add-button')
		.addClass('remove-button')
		.text('Remove');

	if($(this).hasClass('incorrect')){
		$('#num-incorrect span').text(parseInt($('#num-incorrect span').text()) + 1);
		originalClass = (curClass=='pos' ? 'neg' : 'pos');
		$('#num-incorrect-' + originalClass + ' span').text(parseInt($('#num-incorrect-' + originalClass + ' span').text()) + 1);
	}

	tweet.find('.incorrect-button').prop('disabled',false);
	tweet.find('.correct-button').prop('disabled',false);

	applyFilters();
}

function calcPercentages(){

}

function addToTraining(tweet){

}




