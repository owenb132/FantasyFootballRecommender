This application runs on Python Flask and uses Python 2.7
Installation instructions can be found here: http://flask.pocoo.org/docs/0.10/installation/


Flask Installation on Mac OS X:

First install virtualenv. If you have pip installed it can easily be done through the terminal using the command:
pip install virtualenv

In the terminal change directory to the folder containing the application and then create a new virtualenv.
virtualenv venv

To activate the virtualenv use:
. venv/bin/activate

while the virtualenv is active install all the requirements with
pip install -r requirements.txt

Before running the application you also need to have a Twitter development account and add your Twitter API access information to the config.py file

To set up a Twitter development account I followed these directions:
1.     Install oauth2
2.     Go to https://dev.twitter.com/apps (https://dev.twitter.com/apps ) and log in with your twitter credentials.
3.     Click "Create new application". Fill out the form and agree to the terms.
4.     Put in a dummy website (http://localhost.com, for example).
5.     On tab "API Keys", Click "Create my access token." You can Read more about Oauth authorization.
(https://www.google.com/url?q=https%3A%2F%2Fdev.twitter.com%2Fdocs%2Fauth&sa=D&sntz=1&usg=AFQjCNEmpfOUG6OOWl45UGOoVyxab6tF7w)
6.     You will get Consumer Key (API Key),   Access token that you need

Using the Twitter API keys complete the config.py file
CONSUMER_KEY = '<Consumer Key>'
CONSUMER_SECRET = '<Consumer Secret>'
ACCESS_KEY = '<Access Key>'
ACCESS_SECRET = '<Access Secret>'

To run the application, go to the application directory where run.py is stored. Then run:
python run.py
to start a local server

Then in a browser go to the localhost:
http://127.0.0.1:5000/

A demo can be found at www.williammakabenta.com/ffir
More information on this project can be found at http://williammakabenta.com/projects

