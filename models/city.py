from wtforms import Form, TextField, FileField

from config import db

## TBD: need a Version ID and a "setup complete" possibly

class City(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    logo = db.Column(db.String)

    def validate_logo(form, field):
        if field.data:
            field.data = re.sub(r'[^a-z0-9_.-]', '_', field.data)

    def __init__(self, name='', logo=''):
        self.name = name
        self.logo = logo

    def __repr__(self):
        return '<City %r>' % self.name

    @staticmethod
    def get():
        city = City.query.get(1)
        if not city:
            city = City()
        return city

# TBD validators
class CityForm(Form):
    name = TextField('Name',default='')
    logo = FileField('Logo',default='')

    def copy(self,city):
        self.name.data = city.name
        self.logo.data = city.logo
