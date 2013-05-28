from flask import Blueprint, request, redirect, render_template, session, url_for
from flask.ext.mail import Message
from werkzeug import secure_filename

from models.app import *
from models.user import *
from models.financial import *
from models.fund import *
from config import *

from datetime import datetime
import os
import re

admin = Blueprint('admin', __name__)

### Installation ### 

@admin.route('/install',methods=['POST'])
def install():
    users = User.all()
    if users:
        app = App.get()
        app.installed = True
        db.session.commit()
        return url_for('index.show')
    return "You must add at least one administrative user.",401

def installed():
    try:
        app = App.get()
        return app.installed
    except:
        return False

#### Login ####

@admin.route('/login')
def login():
    if authenticated():
        return redirect(url_for('index.show'))

    return render_template('login.html',
                           city=city,
                           code_form=CodeForm(),
                           login_form=LoginForm())

@admin.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index.show'))

@admin.route('/login/getcode',methods=['POST'])
def getCode():
    form = CodeForm(request.form)
    if not form.validate() or not form.email.data:
        return 'Enter a valid email address.',401
    # lookup user via email
    user = User.get_email(form.email.data)
    if not user:
        if form.kind.data == 'email':
            return 'Code sent. Check your email.'
        else:
            return 'Code sent. Check your phone.'

    # only generate a new code if the old one has expired
    if user.date:
        diff = datetime.now() - user.date
        if diff.total_seconds() < 300:
            if form.kind.data == 'email':
                return 'Code sent. Check your email.'
            else:
                return 'Code sent. Check your phone.'

    # generate and save code and current datetime
    code = ''.join(random.choice(string.uppercase + string.digits) for x in range(4)) + ' '
    code += ''.join(random.choice(string.uppercase + string.digits) for x in range(4)) + ' '
    code += ''.join(random.choice(string.uppercase + string.digits) for x in range(4)) + ' '
    code += ''.join(random.choice(string.uppercase + string.digits) for x in range(4))
    user.code = code
    user.date = datetime.now()
    db.session.commit()

    # send email or text code
    if form.kind.data == 'email':
        msg = Message("Citizen Budget login code",
                      sender='daniel.zappala@gmail.com',
                      recipients=[form.email.data])
        msg.body = 'Enter this code into the login form:\n\n'+code+'\n\n'
        msg.body += 'If you did not request this code, ignore it and it will expire in five minutes.'
        mail.send(msg)
        return 'Code sent. Check your email.'

    else:
        msg = Message("Citizen Budget login code",
                      sender='daniel.zappala@gmail.com',
                      recipients=[re.sub(r"[()-]", "", user.phone)+carrier(user.carrier)])
        msg.body = code + ' (expires in 5 minutes)'
        mail.send(msg)
        return 'Code sent. Check your phone.'


def carrier(name):
    if name == 'AT&T':
        return '@txt.att.net'
    if name == 'Verizon':
        return '@vtext.com'
    if name == 'T-Mobile':
        return '@tmomail.net'
    if name == 'Sprint':
        return '@messaging.springpcs.com'
    if name == 'Virgin Mobile':
        return '@vmobl.com'

@admin.route('/login/sendcode',methods=['POST'])
def sendCode():
    form = LoginForm(request.form)
    if not form.validate():
        return 'Enter a valid email address and code.', 401

    # lookup user via email
    user = User.get_email(form.email.data)
    if not user:
        return 'Enter a valid code',401

    if user.code == '' or user.date == None:
        return 'Enter a valid code.',401
    if user.code != form.code.data:
        return 'Enter a valid code.',401
    diff = datetime.now() - user.date
    if diff.total_seconds() > 300:
        return 'Code expired.',401

    session['auth'] = form.email.data
    callback = '/'
    if 'callback' in session:
        callback = session['callback']
    return callback

def authenticated():
    return 'auth' in session

#### Users ####

@admin.route('/users')
def users():
    if not authenticated():
        session['callback'] = "/users"
        return redirect(url_for('admin.login'))

    users = User.all()
    return render_template('users.html',
                           city = city,
                           users=users,
                           user_form=UserForm())


@admin.route('/users/add',methods=['POST'])
def addUser():
    # If not authenticated, only allow if in the process of installing
    if not authenticated() and installed():
        return 'Authentication needed.',401

    form = UserForm(request.form)
    if form.validate():
        user = User(name=form.name.data,
                    email=form.email.data,
                    phone=form.phone.data,
                    carrier=form.carrier.data)
        db.session.add(user)
        db.session.commit()

    users = User.all()
    return render_template('users-info.html',users=users,user_form=UserForm())

@admin.route('/users/edit/<userID>',methods=['POST'])
def editUser(userID):
    # If not authenticated, only allow if in the process of installing
    if not authenticated() and installed():
        return 'Authentication needed.',401

    user = User.get(userID)
    form = UserForm(request.form)
    if form.validate():
        user.name=form.name.data
        user.email=form.email.data
        user.phone=form.phone.data
        user.carrier=form.carrier.data
        db.session.commit()

    users = User.all()
    return render_template('users-info.html',users=users,user_form=UserForm())

@admin.route('/users/remove/<userID>',methods=['POST'])
def removeUser(userID):
    # If not authenticated, only allow if in the process of installing
    if not authenticated() and installed():
        return 'Authentication needed.',401

    user = User.get(userID)
    if user:
        db.session.delete(user)
        db.session.commit()

    users = User.all()
    return render_template('users-info.html',users=users,user_form=UserForm())

#### Financials ####

@admin.route('/financials')
def financials():
    if not authenticated():
        session['callback'] = "/financials"
        return 'Authentication needed.',401

    financials = Financial.all()
    return render_template('financials.html',
                           city = city,
                           financials=financials,
                           financial_form=FinancialForm())

@admin.route('/financials/add',methods=['POST'])
def addFinancial():
    if not authenticated():
        return 'Authentication needed.',401

    form = FinancialForm(request.form)
    # TBD: be sure this year hasn't been added already
    # TBD: be sure the file name is unique
    if form.validate():
        file = Financial(year=form.year.data)
        upload = request.files['budget']
        if upload and allowed_file(upload.filename):
            filename = secure_filename(upload.filename)
            path = os.path.join(app.config['BUDGET_FOLDER'], filename)
            upload.save(path)
            file.name = filename
            file.size = os.path.getsize(path)

            db.session.add(file)
            db.session.commit()

    financials = Financial.all()
    return render_template('financials-info.html',financials=financials)

@admin.route('/financials/edit/<fileID>',methods=['POST'])
def editFinancial(fileID):
    # If not authenticated, only allow if in the process of installing
    if not authenticated() and installed():
        return 'Authentication needed.',401

    financial = Financial.get(fileID)
    financial_form = FinancialForm(request.form)
    if financial_form.validate():
        # TBD remove old data
        upload = request.files['budget']
        if upload and allowed_file(upload.filename):
            # remove old file
            if financial.name:
                path = os.path.join(app.config['BUDGET_FOLDER'], financial.name)
                try:
                    os.remove(path)
                except:
                    pass
            # upload new file
            financial.year = financial_form.year.data
            filename = secure_filename(upload.filename)
            path = os.path.join(app.config['BUDGET_FOLDER'], filename)
            upload.save(path)
            financial.name = filename
            financial.size = os.path.getsize(path)

            db.session.commit()

    financials = Financial.all()
    return render_template('financials-info.html',financials=financials)

@admin.route('/financials/remove/<fileID>',methods=['POST'])
def removeFinancial(fileID):
    # If not authenticated, only allow if in the process of installing
    if not authenticated() and installed():
        return 'Authentication needed.',401

    financial = Financial.get(fileID)
    if financial:
        # remove old file
        if financial.name:
            path = os.path.join(app.config['BUDGET_FOLDER'], financial.name)
            try:
                os.remove(path)
            except:
                pass

        # TBD remove old data

        db.session.delete(financial)
        db.session.commit()

    financials = Financial.all()
    return render_template('financials-info.html',financials=financials)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS


@admin.route('/funds')
def funds():
    if not authenticated():
        session['callback'] = "/funds"
        return 'Authentication needed.',401

    funds = Fund.all()
    return render_template('funds.html',
                           city = city,
                           funds=funds)
