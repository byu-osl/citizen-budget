from config import db

## TBD: need a Version ID and a "setup complete" possibly

class City(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    logo = db.Column(db.String)
    installed = db.Column(db.Boolean)

    def __init__(self, name='', logo=''):
        self.name = name
        self.logo = logo
        self.installed = False

    def __repr__(self):
        return '<City %r>' % self.name

    @staticmethod
    def get():
        return City.query.get(1)
