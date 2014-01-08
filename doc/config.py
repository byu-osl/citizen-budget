from flask import Flask
from flask.ext.mail import Mail
from flask.ext.sqlalchemy import SQLAlchemy

from models.city import *

# basic config
app = Flask(__name__)
app.config["SECRET_KEY"] = ""
app.config['FINANCIALS'] = '/tmp/'
ALLOWED_EXTENSIONS = set(['txt', 'png', 'jpg', 'jpeg', 'gif'])

# database config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/test.db'
# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://budget:budget@localhost/budget'
db = SQLAlchemy(app)

# city config
city = City()
city.name = 'Cedar Hills'
city.logo = 'logo.png'
city.parser = 'caselle'
# city logo must be placed in /static/img/

# email config
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_DEBUG'] = app.debug
app.config['MAIL_USERNAME'] = ''
app.config['MAIL_PASSWORD'] = ''
app.config['DEFAULT_MAIL_SENDER'] = ''
mail = Mail(app)

# logging
ADMINS = []
emailAddress = ''
emailPassword = ''
logFile = '/var/log/cb/cb-log'
