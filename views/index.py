from flask import Blueprint, request, redirect, render_template, session, url_for

from models.user import *
from models.city import *

from admin import authenticated, adminPage, installed

### Home Page ### 

index = Blueprint('index', __name__)

@index.route('/')
def show():
    if installed():
        # return home page
        return render_template('index.html')

    # create DB if needed
    create = False
    try:
        users = User.all()
    except:
        create = True
    if create:
        db.create_all()

    return adminPage(install=True)
