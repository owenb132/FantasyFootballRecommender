from flask import render_template, url_for, request, json
from app import app, tAPI, nb, util
import tweepy, nltk

@app.route('/')
@app.route('/index')
def index():
	return render_template('index.html')

@app.route('/player', methods=['POST'])
def getPlayerTweets():
	playerName = request.form['name']
	query =  playerName.lower() + ' fantasy'

	tweets = []
	t = tweepy.Cursor(tAPI.search, q=query).items(app.config['MAX_TWEETS'])

	overallScore = {}
	while True:
		try:
			tweet = t.next()
			twt = {}
			# Get tweet attributes
			twt['id'] = tweet.id
			twt['retweet_count'] = tweet.retweet_count
			twt['favorite_count'] = tweet.favorite_count
			twt['text'] = tweet.text
			# Classify text
			text = [util.strip_punctuation(w.lower()) for w in nltk.word_tokenize(tweet.text) if w.lower() not in app.config['STOPWORDS']]
			score = util.classify(nb, text)
			tClass = max(score, key=score.get)
			twt['score'] = score
			twt['classification'] = tClass
			tweets.append(twt)
			if tClass not in overallScore:
				overallScore[tClass] = 0
			overallScore[tClass] += 1
		except tweepy.TweepError:
			time.sleep(60*15)
			continue
		except StopIteration:
			break
	decision = "Insufficient Data"
	if len(overallScore):
		decision = max(overallScore, key=overallScore.get)
		if len(tweets) < 10:
			decision = 'Sit'
		elif overallScore['pos'] == overallScore['neg']:
			decision = 'Sit'
		elif decision == 'pos':
			decision = 'Start'
		else:
			decision = 'Sit'

	return json.dumps({'status':'OK', 'tweets':tweets, 'score':overallScore, 'decision':decision})

@app.route('/training', methods=['POST'])
def addToTraining():
	classification = request.form['classification']
	tweet = request.form['text']
	filepath = app.config["REVIEW_PATH"] + classification + '-review.txt'
	with open(filepath, 'a') as f:
		f.write(tweet.replace('\n', ' ') + '\n')
	return json.dumps({'status':'OK'})


