from wtforms import Form, TextField, SelectField

from config import db

## TBD: need a Version ID and a "setup complete" possibly

class City(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    display = db.Column(db.String)

    def __init__(self, name='', display=''):
        self.name = name
        self.display = display

    def __repr__(self):
        return '<City %r>' % self.name

    @staticmethod
    def get_name(name):
        city = City.query.filter_by(name=name).first()
        if not city:
            city = City()
        print city.name
        return city
