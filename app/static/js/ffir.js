$(document).ready(function(){
	// Enter key listener for text input
	$('#player-input').keypress(function(e){
		if((e.keyCode ? e.keyCode : e.which) == 13){
			// Stop form submit action
			e.preventDefault();
			e.stopPropagation();
			// Query for player
			queryPlayer($(this).val());
		}
	});

	// Arrow key navigation of pages
	$(document).keydown(function(e) {
    switch(e.which) {
        case 37: // left
        if($('#evaluation-page').css('top')=='0px' && $('#evaluation-page').css('left')=='0px'){
        	$('#eval-back-button').click();
        	e.preventDefault();
        }
        break;

        case 38: // up
        if($('#overview-page').css('top')=='0px' && ($('#overview-page').css('left')=='auto' || $('#overview-page').css('left')=='0px'))
        	$('#overview-back-button').click();
        e.preventDefault();
        break;

        case 39: // right
        if($('#overview-page').css('top')=='0px' && ($('#overview-page').css('left')=='auto' || $('#overview-page').css('left')=='0px')){
        	$('#eval-button').click();
        	e.preventDefault();
        }
        break;

        case 40: // down
        if($('#more-button').css('display') == 'block' && $('#search-page').css('top') == '0px')
        	$('#more-button').click();
        e.preventDefault();
        break;

        default: return; // exit this handler for other keys
    }
    //e.preventDefault(); // prevent the default action (scroll / move caret)
});

	$('#more-button').click(function(){
		$('#search-page').animate({ top: '-100%' }, 300);
		$('#overview-page').animate({ top: '0' }, 300);
		$('#evaluation-page').animate({ top: '0' }, 300);
	});

	$('#overview-back-button').click(function(){
		$('#search-page').animate({ top: '0' }, 300);
		$('#overview-page').animate({ top: '100%' }, 300);
		$('#evaluation-page').animate({ top: '100%' }, 300);
	});

	$('#eval-button').click(function(){
		calcEval();
		$('#overview-page').animate({ left: '-100%' }, 300);
		$('#evaluation-page').animate({ left: '0' }, 300);
	});

	$('#eval-back-button').click(function(){
		$('#overview-page').animate({ left: '0' }, 300);
		$('#evaluation-page').animate({ left: '100%' }, 300);
	});

	// Applies filters to tweet list based off of checkboxes
	$('#tweet-filter input:checkbox').change(function(){ filterTweets(); });

	// Tweet button handlers
	$(document).on('click', '.incorrect-button', function(){ switchClass($(this).closest('.tweet'), 'incorrect'); });
	$(document).on('click', '.correct-button', function(){ switchClass($(this).closest('.tweet'), 'correct'); });
	$(document).on('click', '.remove-button', function(){ toggleUse($(this).closest('.tweet'), 'removed'); });
	$(document).on('click', '.add-button', function(){ toggleUse($(this).closest('.tweet'), 'included'); });

	// Adds the selected tweet to the training data
	$(document).on('click', '.update-button', function(){ addToTraining($(this).closest('.tweet')); });
});

// Queries for tweets about a player
function queryPlayer(name){
	hideSearchResults();
	$('#tweet-list').empty();
	resetFilters();

	// Error message for no input
	if($.trim(name) == '')
		showSearchMessage("Please Enter a Name");
	// Ajax call to query for player tweets
	else{
		showLoader();
		// Get ajax request data + url
		var formData = new FormData($('#search-form')[0]);
		var url = '/player';

		$.ajax({
			type: 'POST',
			url: url,
			data: formData,
			contentType: false,
			processData: false,
			cache: false,
			success: function(result){
				$('#search-loader').hide();
				jResult = $.parseJSON(result);
				showSearchMessage(jResult.decision);
				initOverview(jResult.score, jResult.tweets);
				showSearchResult();
			},
			error: function(data, textStatus, jqXHR){
				$('#search-loader').hide();
				showSearchMessage("Error. Please Try Again.");
			}
		});
	}
}

function hideSearchResults(){
	$('#search-decision').hide();
	$('#more-button').hide();
}

// Show loader when search is occuring
function showLoader(){
	$('#search-loader').css('opacity',0);
	$('#search-loader').show();
	$('#search-loader').animate({opacity:1}, 1000);
}

// Display search message
function showSearchMessage(message){
	$('#search-decision').css('opacity', 0);
	$('#search-decision').text(message);
	$('#search-decision').show();
	$('#search-decision').animate({opacity:1}, 1000);
}

// Display more button after successful search
function showSearchResult(message){
	$('#more-button').css('opacity', 0);
	$('#more-button').show();	
	$('#more-button').animate({opacity:1}, 500);	
}

function initOverview(score, tweets){
	//$('#pos-score').text(score['pos']);
	//$('#neg-score').text(score['neg']);

	$.each(tweets, function(key,value){	addToTweetList(value, key);	});

	updateClassCount();	
}

function addToTweetList(tweet, index){
	$('#tweet-list').append(
		$('<div class="tweet correct included ' + tweet.classification + '">')
			.append($('<div class="tweet-index">').text(index+1))
			.append($('<div class="tweet-text">').text(tweet.text))
			.append($('<div class="tweet-info">')
				.append($('<div>Class: <span class="tweet-class">' + tweet.classification + '</span></div>'))
				//.append($('<div>Weight: <span class="tweet-weight">' + tweet.weight + '</span></div>'))
				.append($('<div>Retweets: <span class="tweet-retweets">' + tweet.retweet_count + '</span></div>'))
				.append($('<div>Favorites: <span class="tweet-favorites">' + tweet.favorite_count + '</span></div>'))
				.append($('<button class="incorrect-button">').text("Switch Class"))
				.append($('<button class="remove-button">').text("Remove"))
				.append($('<button class="update-button">').text("Add to Training"))
			)
	);
}

// Updates the overview summary classification counts/percents
function updateClassCount(){
	// Classification tweet count
	pnum = parseInt($('#tweet-list').find('.pos:not(.removed)').length);
	nnum = parseInt($('#tweet-list').find('.neg:not(.removed)').length);
	total = parseInt(pnum+nnum);
	$('#pos-num').text(pnum);
	$('#neg-num').text(nnum);

	// Classification tweet percentage
	pper = (pnum!=0) ? (pnum/total*100) : 0;
	nper = (nnum!=0) ? (nnum/total*100) : 0;
	$('#pos-percent').text('%' + pper.toFixed(2));
	$('#neg-percent').text('%' + nper.toFixed(2));

	// Updates start/sit decision based on changes
	if(pnum != 0 && pnum != nnum)
		$('#search-decision').text((pnum > nnum && total > 9) ? 'Start' : 'Sit');
}

// Hides/shows tweets based on filter checkbox selections
function filterTweets(){
	$('.tweet').show();
	unchecked = $('#tweet-filter').find('input:checkbox:not(:checked)');
	unchecked.each(function(i){	$('.' + $(this).val()).hide(); });
}

// Hides/shows a tweet based on the filter checkbox selections
function filterTweet(tweet){
	tweet.show();
	unchecked = $('#tweet-filter').find('input:checkbox:not(:checked)');
	unchecked.each(function(i){
		if(tweet.hasClass($(this).val())){
			tweet.hide();
			return false;
		}
	});
}

// Resets checkboxes to default checked state
function resetFilters(){
	$('#tweet-filter input').prop('checked', true);
	$('#rem-check').prop('checked', false);
}

// Switches the class of a tweet
function switchClass(tweet, status){
	// Switch tweet correctness label
	oldStatus = (status=='incorrect') ? 'correct' : 'incorrect';
	tweet.removeClass(oldStatus).addClass(status);
	// Switch tweet classification
	oldClass = tweet.find('.tweet-class').text();
	newClass = (oldClass == 'pos') ? 'neg' : 'pos';
	tweet.removeClass(oldClass).addClass(newClass);
	tweet.find('.tweet-class').text(newClass);
	// Change tweet buttons
	tweet.find('.'+status+'-button').removeClass().addClass(oldStatus+'-button');
	tweet.find($('.update-button')).show();
	// Update overview and apply filter to tweet
	updateClassCount();
	filterTweet(tweet);
}

// Includes/removes a tweet
function toggleUse(tweet, status){
	// Switch tweet use label
	oldStatus = (status=='removed') ? 'included' : 'removed';
	tweet.removeClass(oldStatus).addClass(status);
	// Change button label and class
	btnClass = (status=='removed') ? 'add' : 'remove';
	tweet.find($('.add-button, .remove-button'))
		.removeClass()
		.addClass(btnClass + '-button')
		.html(btnClass=='add' ? 'Include' : 'Remove');
	// Change button disabled property
	btnDisabled = (status=='removed')
	tweet.find('.incorrect-button').prop('disabled', btnDisabled);
	tweet.find('.correct-button').prop('disabled', btnDisabled);
	tweet.find('.update-button').prop('disabled', btnDisabled);
	// Update overview and apply filter to tweet
	updateClassCount();
	filterTweet(tweet);
}

function calcEval(){
	// Get # of removed tweets
	$('#num-removed').text($('#tweet-list').find('.removed').length);

	// Get table values
	tp = $('#tweet-list').find('.pos.correct:not(.removed):not(.incorrect)').length;
	tn = $('#tweet-list').find('.neg.correct:not(.removed):not(.incorrect)').length;
	fp = $('#tweet-list').find('.neg.incorrect:not(.removed)').length;
	fn = $('#tweet-list').find('.pos.incorrect:not(.removed)').length;
	$('#tp').text(tp);
	$('#fn').text(fn);
	$('#fp').text(fp);
	$('#tn').text(tn);

	// Precision, Recall, FMeasure for positive class
	pP = (tp != 0) ? tp/(tp+fp) : 0;
	pR = (tp != 0) ? tp/(tp+fn) : 0;
	pF = (pP+pR != 0) ? (2*pP*pR)/(pP+pR) : 0;
	$('#pos-precision').text(pP.toFixed(2));
	$('#pos-recall').text(pR.toFixed(2));
	$('#pos-fmeasure').text(pF.toFixed(2));
	// Precision, Recall, FMeasure for negative class
	nP = (tn != 0) ? tn/(tn+fn) : 0;
	nR = (tn != 0) ? tn/(tn+fp) : 0;
	nF = (nP+nR != 0) ? (2*nP*nR)/(nP+nR) : 0;
	$('#neg-precision').text(nP.toFixed(2));
	$('#neg-recall').text(nR.toFixed(2));
	$('#neg-fmeasure').text(nF.toFixed(2));
}

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

//TODO: Abort ajax calls when another one is made
