

from . import db


class ExampleTable(db.Model):
    __tablename__ = 'example_table'

    id = db.Column(db.Integer, primary_key=True)
