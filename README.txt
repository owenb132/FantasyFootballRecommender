This application runs on Python Flask
Installation instructions can be found here: http://flask.pocoo.org/docs/0.10/installation/



Flask Installation on Mac OS X:

First install virtualenv. If you have pip installed it can easily be done through the terminal using the command:
pip install virtualenv

In the terminal change directory to the folder containing the application and then create a new virtualenv.
virtualenv venv

To activate the virtualenv use:
. venv/bin/activate

while the virtualenv is active install Flask
pip install Flask

the application also uses tweepy so install that too
pip install tweepy

I'm not entirely sure of how to install FLask on Windows but you should be able to install pip which will allow you to install the other requirements


To run the application, go to the application directory where run.py is stored. Then run:
python run.py
to start a local server

Then in a browser go to the localhost:
http://127.0.0.1:5000/


I do plan on hosting this project on my own personal website at some point. Whenever I do get around to doing that, I'll probably have it up on www.williammakabenta.com/ffir