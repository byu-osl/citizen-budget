from flask import Blueprint, request, redirect, render_template, session, url_for

from models.user import *
from models.city import *
from config import *

from admin import authenticated, adminPage, installed

### Home Page ### 

index = Blueprint('index', __name__)

@index.route('/')
def show():
    city = City.get_name(city_name)
    if installed():
        # return home page
        return render_template('index.html',city=city)

    create_db()
    return adminPage(install=True)

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
    # populate city table
    city = City(name='cedarhills-utah',display='Cedar Hills')
    db.session.add(city)
    db.session.commit()
