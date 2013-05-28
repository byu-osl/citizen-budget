from config import db

class Fund(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    description = db.Column(db.String)
    years = db.relationship('Year',backref='fund')

    def __init__(self, name='', description=''):
        self.name = name
        self.description = description

    @staticmethod
    def all():
        return Fund.query.all()

    @staticmethod
    def get_name(name):
        return Fund.query.filter_by(name=name).first()

    def get_year(self,date):
        return self.years.query.filter_by(date=date).first()

class Year(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Integer)
    total_revenue = db.Column(db.Float)
    budgeted_revenue = db.Column(db.Float)
    total_expenditures = db.Column(db.Float)
    budgeted_expenditures = db.Column(db.Float)
    fund_id = db.Column(db.Integer, db.ForeignKey('fund.id'))
    categories = db.relationship('Category',backref='year')

    def __init__(self,date=None,fund=None):
        self.date=date
        self.fund = fund

    @staticmethod
    def get_category(name,revenue):
        return self.categories.query.filter_by(name=name,revenue=revenue).first()

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    revenue = db.Column(db.Boolean)
    name = db.Column(db.String)
    total = db.Column(db.Float)
    budget = db.Column(db.Float)
    year_id = db.Column(db.Integer, db.ForeignKey('year.id'))
    items = db.relationship('Item',backref='category')

    def __init__(self,name='',revenue=True,year=None):
        self.name = category
        self.revenue = revenue
        self.year = year

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
