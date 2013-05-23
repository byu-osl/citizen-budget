from wtforms import *

from config import db

import json
import random
import string

# TBD: database error when email is not unique on add

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True)
    name = db.Column(db.String)
    phone = db.Column(db.String)
    carrier = db.Column(db.String)
    code = db.Column(db.String, default='')
    date = db.Column(db.DateTime,default=None)

    def __init__(self, name='',phone=0,carrier='',email=''):
        self.name = name
        self.phone = phone
        self.carrier = carrier
        self.email = email

    def __repr__(self):
        return '<User %r>' % self.email

    @staticmethod
    def all():
        return User.query.all()

    @staticmethod
    def get(userID):
        return User.query.get(userID)

    @staticmethod
    def get_email(email):
        return User.query.filter_by(email=email).first()

    def jsonify(self):
        return json.dumps({'id':self.id,'name':self.name,'email':self.email,
                           'phone':self.phone,'carrier':self.carrier})

# TBD validators
class UserForm(Form):
    name = TextField('Name',default='')
    phone = TextField('Cell Phone Number')
    carrier = SelectField('Cell Carrier',choices=[('AT&T','AT&T'),('Verizon','Verizon'),('T-Mobile','T-Mobile'),('Sprint','Sprint'),('Virgin Mobile','Virgin Mobile')])
    email = TextField('Email')

# TBD validators
class CodeForm(Form):
    email = TextField('Email',default='')
    kind = RadioField('Login Using',choices=[('email','Email'),('text','Text Message')],default='email')

class LoginForm(Form):
    email = TextField('Email',default='')
    code = TextField('Code',default='')
