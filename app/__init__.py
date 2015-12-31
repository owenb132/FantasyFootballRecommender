from flask import Flask
import tweepy

app = Flask(__name__)
app.config.from_object('config')

# Set up twitter/tweepy API
tAuth = tweepy.OAuthHandler(app.config['CONSUMER_KEY'], app.config['CONSUMER_SECRET'])
tAuth.set_access_token(app.config['ACCESS_KEY'], app.config['ACCESS_SECRET'])
tAPI = tweepy.API(tAuth)

from app import views