from config import db

## TBD: need a Version ID?

class App(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    installed = db.Column(db.Boolean)

    def __init__(self):
        self.installed = False

    @staticmethod
    def get():
        return App.query.get(1)
