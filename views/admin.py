from flask import Blueprint, request, redirect, render_template, session, url_for
from flask.ext.mail import Message
from werkzeug import secure_filename

from models.user import *
from models.city import *
from models.file import *
from config import *

from datetime import datetime
import os
import re

### Admin Page ### 

admin = Blueprint('admin', __name__)

@admin.route('/')
def show():
    if not authenticated() and installed():
        session['callback'] = "/admin"
        return redirect(url_for('admin.login'))

    return adminPage()

def adminPage(install=False):
    city = City.get()
    city_form = CityForm()
    city_form.copy(city)
    users = User.all()
    files = File.all()
    template = 'admin.html'
    if install:
        template = 'install.html'
    return render_template(template,
                           install=install,
                           city=city,
                           city_form=city_form,
                           users=users,
                           user_form=UserForm(),
                           files=files,
                           file_form=FileForm())


#### Login ####

@admin.route('/login')
def login():
    if authenticated():
        return redirect(url_for('index.show'))

    return render_template('login.html',
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

def installed():
    try:
        users = User.all()
    except:
        users = None
    if users:
        return True
    return False

#### City ####

@admin.route('/city',methods=['POST'])
def updateCity():
    # If not authenticated, only allow if in the process of installing
    if not authenticated() and installed():
        return 'Authentication needed.',401

    city = City.get()
    form = CityForm(request.form)
    if form.validate():
        city.name = form.name.data
        upload = request.files['logo']
        if upload and allowed_file(upload.filename):
            filename = secure_filename(upload.filename)
            upload.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            city.logo = filename
        db.session.add(city)
        db.session.commit()

    return render_template('admin-city.html',city=city)

#### Users ####

@admin.route('/user/add',methods=['POST'])
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
    return render_template('admin-users.html',users=users)

@admin.route('/user/edit/<userID>',methods=['POST'])
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
    return render_template('admin-users.html',users=users)

@admin.route('/user/remove/<userID>',methods=['POST'])
def removeUser(userID):
    # If not authenticated, only allow if in the process of installing
    if not authenticated() and installed():
        return 'Authentication needed.',401

    user = User.get(userID)
    if user:
        db.session.delete(user)
        db.session.commit()

    users = User.all()
    return render_template('admin-users.html',users=users)

#### Files ####

@admin.route('/file/add',methods=['POST'])
def addFile():
    # If not authenticated, only allow if in the process of installing
    if not authenticated() and installed():
        return 'Authentication needed.',401

    form = FileForm(request.form)
    # TBD: be sure this year hasn't been added already
    # TBD: be sure the file name is unique
    if form.validate():
        file = File(year=form.year.data)
        upload = request.files['budget']
        if upload and allowed_file(upload.filename):
            filename = secure_filename(upload.filename)
            path = os.path.join(app.config['BUDGET_FOLDER'], filename)
            upload.save(path)
            file.name = filename
            file.size = os.path.getsize(path)

            db.session.add(file)
            db.session.commit()

    files = File.all()
    return render_template('admin-files.html',files=files)

@admin.route('/file/edit/<fileID>',methods=['POST'])
def editFile(fileID):
    # If not authenticated, only allow if in the process of installing
    if not authenticated() and installed():
        return 'Authentication needed.',401

    file = File.get(fileID)
    form = FileForm(request.form)
    if form.validate():
        print "OK"
        # TBD remove old data
        upload = request.files['budget']
        if upload and allowed_file(upload.filename):
            print "remove"
            # remove old file
            if file.name:
                path = os.path.join(app.config['BUDGET_FOLDER'], file.name)
                try:
                    os.remove(path)
                except:
                    pass
            # upload new file
            file.year = form.year.data
            filename = secure_filename(upload.filename)
            path = os.path.join(app.config['BUDGET_FOLDER'], filename)
            upload.save(path)
            file.name = filename
            file.size = os.path.getsize(path)

            db.session.commit()

    files = File.all()
    return render_template('admin-files.html',files=files)

@admin.route('/file/remove/<fileID>',methods=['POST'])
def removeFile(fileID):
    # If not authenticated, only allow if in the process of installing
    if not authenticated() and installed():
        return 'Authentication needed.',401

    file = File.get(fileID)
    if file:
        # remove old file
        if file.name:
            path = os.path.join(app.config['BUDGET_FOLDER'], file.name)
            try:
                os.remove(path)
            except:
                pass

        # TBD remove old data

        db.session.delete(file)
        db.session.commit()

    files = File.all()
    return render_template('admin-files.html',files=files)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS
