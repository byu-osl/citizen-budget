from config import db

import json

class Year(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Integer, unique=True)
    total_revenue = db.Column(db.Float, default=0)
    budgeted_revenue = db.Column(db.Float, default=0)
    total_expenditures = db.Column(db.Float, default=0)
    budgeted_expenditures = db.Column(db.Float, default=0)
    funds = db.relationship('Fund',backref='year',lazy='dynamic',cascade="all, delete, delete-orphan")

    def __init__(self,date=None,fund=None):
        self.date=date
        self.fund = fund

    @staticmethod
    def all():
        return Year.query.all()

    @staticmethod
    def get_recent():
        return Year.query.order_by(Year.date.desc()).first()

    @staticmethod
    def get_date(date):
        try:
            return Year.query.filter_by(date=date).one()
        except:
            return None

    def get_fund(self,name=''):
        try:
            return self.funds.filter_by(name=name).one()
        except:
            return None

class Fund(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    url = db.Column(db.String)
    total_revenue = db.Column(db.Float, default=0)
    budgeted_revenue = db.Column(db.Float, default=0)
    total_expenditures = db.Column(db.Float, default=0)
    budgeted_expenditures = db.Column(db.Float, default=0)
    year_id = db.Column(db.Integer, db.ForeignKey('year.id'))
    categories = db.relationship('Category',backref='year',lazy='dynamic',cascade="all, delete, delete-orphan")

    def __init__(self, name='', description='', year=None):
        self.name = name
        self.url = name.replace(" ","-")
        self.description = description
        if year:
            self.year_id = year.id

    def jsonify(self):
        return json.dumps({'id':self.id,'name':self.name,
                           'description':self.description})

    @staticmethod
    def all():
        return Fund.query.all()

    @staticmethod
    def unique():
        return Fund.query.all()

    @staticmethod
    def get(fundID):
        return Fund.query.get(fundID)

    @staticmethod
    def get_name(name):
        return Fund.query.filter_by(name=name)

    @staticmethod
    def get_url_year(url,date):
        return Fund.query.filter_by(url=url).join(Year).filter_by(date=date).one()

    def revenues(self):
        return self.categories.filter_by(revenue=True).order_by(Category.total.desc())

    def expenditures(self):
        return self.categories.filter_by(revenue=False).order_by(Category.total.desc())

    def get_category(self,name='',revenue=False):
        try:
            return self.categories.filter_by(name=name,revenue=revenue).one()
        except:
            return None

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    revenue = db.Column(db.Boolean)
    name = db.Column(db.String)
    total = db.Column(db.Float)
    budget = db.Column(db.Float)
    fund_id = db.Column(db.Integer, db.ForeignKey('fund.id'))
    items = db.relationship('Item',backref='category',lazy='dynamic',cascade="all, delete, delete-orphan")

    def __init__(self,name='',revenue=True,fund=None):
        self.name = name
        self.revenue = revenue
        if fund:
            self.fund_id = fund.id

    def get_items(self):
        return self.items.order_by(Item.amount.desc())

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String)
    name = db.Column(db.String)
    amount = db.Column(db.Float)
    budget = db.Column(db.Float)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))

    def __init__(self,category=None,code='',name='',amount=0,budget=0):
        self.code = code
        self.name = name
        self.amount = amount
        self.budget = budget
        self.category = category
