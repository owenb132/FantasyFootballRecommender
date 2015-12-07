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
        $(this).is(':checked') ? $('.' + $(this).val()).show() : $('.' + $(this).val()).hide();
    });
});

function lookupPlayer(name){
	$('#more-results').hide();
	$('#tweet-list').empty();
	$('#tweet-filter input').prop('checked', true);

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
	$('#tweet-list').append($('<div class="tweet">').addClass(tweet.classification)
		.append($('<div class="tweet-index">').text(index))
		.append($('<div class="tweet-text">').text(tweet.text))
		.append($('<div class="tweet-info">')
			.append($('<div class="tweet-retweets">').text("Retweets: " + tweet.retweet_count))
			.append($('<div class="tweet-favorites">').text("Favorites: " + tweet.favorite_count))
			.append($('<div class="tweet-class">').text("Class: " + tweet.classification))
		)
	);
}
















