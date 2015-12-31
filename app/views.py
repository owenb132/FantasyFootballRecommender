from flask import render_template, url_for, request, json
from app import app, tAPI, util
import tweepy, nltk, re

@app.route('/')
@app.route('/index')
def index():
	return render_template('index.html')

@app.route('/ffir')
@app.route('/projects/ffir')
def ffir():
	return render_template('Projects/ffir.html')

@app.route('/projects/ffir/player', methods=['POST'])
def getPlayerTweets():
	# Initialize naive bayes classifier
	nb = util.initClassifier(app.config['TRAINING_PATH'], app.config['STOPWORDS'])
	# Get name from form data and set up query
	name = request.form['name']
	query = name.lower() + ' fantasy'
	# Retrieve Tweets
	tweets = []
	queryTweets = tweepy.Cursor(tAPI.search, q=query).items(app.config['MAX_TWEETS']) 
	# Iterate through tweets
	overallScore = {}
	overallScore['pos'] = 0
	overallScore['neg'] = 0
	#rtc = 0
	while True:
		try:
			tweet = queryTweets.next()
			# Ignore retweets
			# Problem with Filtering out RT's while retrieving original. Keep all for now
			#if re.compile(r'^RT @\w+:').search(tweet.text) is None: 
			tweetInfo = {}
			# Get tweet attributes
			tweetInfo['id'] = tweet.id
			tweetInfo['retweet_count'] = tweet.retweet_count
			tweetInfo['favorite_count'] = tweet.favorite_count
			tweetInfo['text'] = tweet.text
			# Scoring for when I figure out that rewteet issue
			#tweetInfo['weight'] = 1 + tweet.retweet_count + max(0, tweet.favorite_count - tweet.retweet_count)
			# Classify text
			text = [util.strip_punctuation(w.lower()) for w in nltk.word_tokenize(tweet.text) if w.lower() not in app.config['STOPWORDS']]
			score = util.classify(nb, text)
			tClass = max(score, key=score.get)
			tweetInfo['class_score'] = score
			tweetInfo['classification'] = tClass
			tweets.append(tweetInfo)
			# Add to classification score
			overallScore[tClass] += 1
			#overallScore[tClass] += tweetInfo['weight']
			#else:
			#	rtc += 1
		except tweepy.TweepError:
			time.sleep(60*15)
		except StopIteration:
			break
	# Determine start/sit recommendation based on score
	decision = "No Tweets. Check back in later."
	# if # of tweets > 0
	if overallScore['neg'] + overallScore['pos'] != 0:
		decision = max(overallScore, key=overallScore.get)
		# Sit if not enough tweets
		if len(tweets) < 10:
			decision = 'Sit'
		# Tie = sit
		elif overallScore['pos'] == overallScore['neg']:
			decision = 'Sit'
		elif decision == 'pos':
			decision = 'Start'
		else:
			decision = 'Sit'
	# Return tweets and classification
	return json.dumps({'status':'OK', 'tweets':tweets, 'score':overallScore, 'decision':decision})

# Adds a tweet to the training data
@app.route('/projects/ffir/training', methods=['POST'])
def addToTraining():
	classification = request.form['classification']
	tweet = request.form['text']
	# strip new line
	tweet = tweet.replace('\n', ' ')
	# add ending white space to help with regex
	tweet = tweet + ' '
	# remove url link
	tweet = re.sub('http[s]?:\/\/\S+\s', '', tweet)
	# remove retweet text indicator
	tweet = re.sub('^RT @\w+:', '', tweet)
	# Remove usernames
	tweet = re.sub('@\w+', '', tweet)
	# Add to class file in review direectory
	filepath = app.config["TRAINING_REVIEW_PATH"] + classification + '.txt'
	with open(filepath, 'a') as f:
		f.write(tweet + '\n')
	return json.dumps({'status':'OK'})
