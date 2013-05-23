from flask import Blueprint, request, redirect, render_template, session, url_for

from models.user import *
from models.city import *

from admin import authenticated

### Home Page ### 

index = Blueprint('index', __name__)

@index.route('/')
def show():
    # TBD
    # check if we are installing
    create = False
    try:
        users = User.all()
    except:
        create = True
    if create:
        db.create_all()
    if create or not users:
        city = City.get()
        city_form = CityForm()
        city_form.copy(city)
        users = User.all()
        return render_template('install.html',
                               city=city,
                               city_form=city_form,
                               users=users,
                               user_form=UserForm())

    # return unauthenticated home page
    return render_template('index.html')
