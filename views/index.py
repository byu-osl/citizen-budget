from flask import Blueprint, render_template

from models.app import *
from models.user import *
from models.fund import *
from models.series import *
from config import *

from admin import authenticated, installed

### Home Page ### 

index = Blueprint('index', __name__)

@index.route('/')
def show():
    if installed():
        # get year
        year = Year.get_recent()

        # get all the funds for this year
        year_funds = Fund.get_year(year.date)

        # setup revenue and expenditures plot
        years = Year.all()
        series = Series()
        revenue = Data(name='Revenue')
        expenditures = Data(name='Expenditures')
        import datetime
        import time
        for year in years:
            revenue.add([year.date,year.total_revenue])
            expenditures.add([year.date,year.total_expenditures])
        series.add(revenue)
        series.add(expenditures)

        print series.jsonify()

        return render_template('index.html',active='home',subactive='',
                               city=city,year=year,fund=year_funds[1],
                               year_funds=year_funds,
                               series=series.jsonify(),
                               charts=show_year(year.date))

    # create database
    create_db()

    users = User.all()
    return render_template('install.html',
                           city=city,
                           users=users,
                           user_form=UserForm())


@index.route('/year/<date>')
def show_year(date):
    # setup current year
    year = Year.get_date(date)

    # setup fund revenue plot
    revenueSeries = Series()
    data = Data(name='Revenue')
    for fund in year.funds:
        data.add([fund.name,fund.total_revenue])
    revenueSeries.add(data)
    data = Data(name='Expenditures')
    for fund in year.funds:
        data.add([fund.name,fund.total_expenditures])
    revenueSeries.add(data)

    return render_template('index-year.html',
                           revenueSeries=revenueSeries.jsonify(),
                           year=year,funds=year.funds)


def create_db():
    # create DB if needed
    create = False
    try:
        users = User.all()
    except:
        create = True
    if not create:
        return
    # create Db tables
    db.create_all()
    # populate app table
    app = App()
    db.session.add(app)
    db.session.commit()
