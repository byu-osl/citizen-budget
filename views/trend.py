from flask import Blueprint, render_template

from models.app import *
from models.user import *
from models.fund import *
from models.series import *
from config import *

from admin import authenticated, installed

### Trend Page ### 

trend = Blueprint('trend', __name__)

@trend.route('/<fund_url>/<category_url>')
def show(fund_url,category_url):
    if not installed():
        return redirect(url_for('index.show'))

    # get all the categories with these identifiers
    categories = Category.get_url_fund(category_url,fund_url)

    # setup yearly category plot
    plot_data = []
    plotted = {}
    series = Series()
    for category in categories:
        for item in category.items:
            if item.code in plotted:
                continue
            plotted[item.code] = True
            data = Data(name=item.name)
            for i in Item.get_code(item.code):
                data.add([i.category.fund.year.date,i.amount])
            plot_data.append(data)

    sorted_data = sorted(plot_data, key = lambda data: max(data.data['data'], key = lambda x: x[1])[1],reverse=True)
    for data in sorted_data:
        series.add(data)

    return render_template('trend.html',active="trend",subactive="",
                           city=city,fund=categories[0].fund,
                           category=categories[0],
                           series=series.jsonify())
