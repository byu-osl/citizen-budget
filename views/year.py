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

    # setup yearly fund plot
    fund = Fund.get_url_year(url=url,date=date)
    funds = Fund.get_name(fund.name)
    series = Series()
    revenue = Data(label='Revenue')
    expenditures = Data(label='Expenditures')
    for f in funds:
        revenue.add([f.year.date,f.total_revenue])
        expenditures.add([f.year.date,f.total_expenditures])
    series.add(revenue)
    series.add(expenditures)

    # setup fund revenue and expenditures plots
    revenueSeries = Series()
    data = Data()
    for category in fund.revenues():
        data.add([category.total,category.name])
    revenueSeries.add(data)
    expendituresSeries = Series()
    data = Data()
    for category in fund.expenditures():
        data.add([category.total,category.name])
        data.color('#afd8f8')
    expendituresSeries.add(data)

    return render_template('year.html',city=city,year=year,fund=fund,
                           series=series.jsonify(),
                           revenueSeries=revenueSeries.jsonify(),
                           expendituresSeries=expendituresSeries.jsonify())

