from flask_wtf import Form

from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired
from wtforms.widgets import TextInput


class AngularJSTextInput(TextInput):
    """
    Create a widget to allow "ng-" attributes for wtforms.
    Template requires argument of ng_*='value' to set the attribute.

    Source:
    http://stackoverflow.com/questions/20440056/custom-attributes-for-flask-wtforms
    """
    def __call__(self, field, **kwargs):
        for key in list(kwargs):
            if key.startswith('ng_'):
                kwargs['ng-' + key[3:]] = kwargs.pop(key)
        return super(AngularJSTextInput, self).__call__(field, **kwargs)


class DataForm(Form):
    """
    Input field to test {widget=AngularJSTextInput}.
    """
    name = StringField('What is your name?',
                       validators=[DataRequired()],
                       widget=AngularJSTextInput())
    location = StringField('What is your location?',
                           validators=[DataRequired()],
                           widget=AngularJSTextInput())
    submit = SubmitField('Submit')
