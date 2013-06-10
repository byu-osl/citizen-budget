from flask import redirect, session, url_for

### Configuration ###
from config import app

### Custom Filters ###

def currency(value):
    return "{:,.2f}".format(value)

app.jinja_env.filters['currency'] = currency

### Handlers ###

from views.index import index
app.register_blueprint(index)

from views.year import year
app.register_blueprint(year, url_prefix="/year")

from views.trend import trend
app.register_blueprint(trend, url_prefix="/trend")

from views.admin import admin
app.register_blueprint(admin, url_prefix="/admin")

from views.city import city
app.register_blueprint(city, url_prefix="/city")

if __name__ == '__main__': 
    app.debug = True
    app.run(host='0.0.0.0')

else:

    import logging
    from logging.handlers import SMTPHandler
    from logging import Formatter
    from config import ADMINS,emailAddress,emailPassword,logFile
    from datetime import date
    
    today = date.today().strftime("%d %m %Y")
    mail_handler = SMTPHandler(('smtp.gmail.com',587),
                               emailAddress,
                               ADMINS, 'Citizen Budget' % today,
                               credentials=(emailAddress,emailPassword),
                               secure=())
    mail_handler.setLevel(logging.ERROR)
    mail_handler.setFormatter(Formatter('''
    Message type:       %(levelname)s
    Location:           %(pathname)s:%(lineno)d
    Module:             %(module)s
    Function:           %(funcName)s
    Time:               %(asctime)s

    Message:

    %(message)s
    '''))

    app.logger.addHandler(mail_handler)

    from logging.handlers import RotatingFileHandler
    file_handler = RotatingFileHandler(logFile,maxBytes=10000,backupCount=5)
    file_handler.setLevel(logging.WARNING)
    app.logger.addHandler(file_handler)

