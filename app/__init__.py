from flask import Flask
#from nbclassifier import initClassifier

import tweepy

app = Flask(__name__)
app.config.from_object('config')

# Set up twitter/tweepy API
tAuth = tweepy.OAuthHandler(app.config['CONSUMER_KEY'], app.config['CONSUMER_SECRET'])
tAuth.set_access_token(app.config['ACCESS_KEY'], app.config['ACCESS_SECRET'])
tAPI = tweepy.API(tAuth)

# Set up naive bayes classifier
from app import util
nb = util.initClassifier()

from app import views