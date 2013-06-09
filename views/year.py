from flask import Blueprint, render_template, request

from models.app import *
from models.user import *
from models.fund import *
from models.series import *
from config import *

from admin import authenticated, installed

### Fund Page ### 

year = Blueprint('year', __name__)

@year.route('/<date>/<url>')
def show(url,date):
    if not installed():
        return redirect(url_for('index.show'))

    # get year
    year = Year.get_date(date)

    # get all the funds for this year
    year_funds = Fund.get_year(date)

    # setup yearly fund plot
    fund = Fund.get_url_year(url=url,date=date)
    funds = Fund.get_name(fund.name)
    series = Series()
    revenue = Data(name='Revenue')
    expenditures = Data(name='Expenditures')
    for f in funds:
        revenue.add([f.year.date,f.total_revenue])
        expenditures.add([f.year.date,f.total_expenditures])
    series.add(revenue)
    series.add(expenditures)

    # setup fund revenue and expenditures plots
    revenueSeries = Series()
    data = Data()
    for category in fund.revenues():
        data.add([category.name,category.total])
    # data.reverse()
    revenueSeries.add(data)
    expendituresSeries = Series()
    data = Data()
    for category in fund.expenditures():
        data.add([category.name,category.total])
    # data.reverse()
    expendituresSeries.add(data)

    return render_template('year.html',active="fund",subactive=fund.url,
                           city=city,year=year,fund=fund,
                           year_funds=year_funds,
                           series=series.jsonify(),
                           revenueSeries=revenueSeries.jsonify(),
                           expendituresSeries=expendituresSeries.jsonify())
