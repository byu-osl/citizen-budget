from flask import Blueprint, request, redirect, render_template, session, url_for

from models.user import *
from models.city import *
from config import *

from admin import authenticated, installed

### Home Page ### 

index = Blueprint('index', __name__)

@index.route('/')
def show():
    if installed():
        city = City.get()
        # return home page
        return render_template('index.html',city=city)

    # create database
    create_db()

    city = City.get()
    users = User.all()
    return render_template('install.html',
                           city=city,
                           users=users,
                           user_form=UserForm())

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
    city = City(name=city_name,logo=city_logo)
    db.session.add(city)
    db.session.commit()
