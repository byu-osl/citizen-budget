from wtforms import *

from config import db

import json
import random
import string

class Financial(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer)
    name = db.Column(db.String)
    size = db.Column(db.Integer)

    def __init__(self, year=0,name='',size=0):
        self.year = year
        self.name = name
        self.size = size

    def jsonify(self):
        return json.dumps({'id':self.id,'year':self.year,
                           'name':self.name,'size':self.size})

    @staticmethod
    def all():
        return Financial.query.all()

    @staticmethod
    def get(fileID):
        return Financial.query.get(fileID)

class FinancialForm(Form):
    year = IntegerField('Year')
    budget = FileField('Budget',default='')
