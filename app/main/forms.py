from flask_wtf import Form

from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired
from wtforms.widgets import TextInput


def get_angularjs_class(base_class):
    """
    Returns a dynamic class widget to allow "ng-" attributes for wtforms.
    Parameter base_class is a wtforms.widget class.
    Template requires argument of ng_*='value' to set the attribute.

    Adapted version of solution from:
    http://stackoverflow.com/questions/20440056/custom-attributes-for-flask-wtforms
    """
    class AngularJSClass(base_class):

        def __call__(self, field, **kwargs):
            for key in list(kwargs):
                if key.startswith('ng_'):
                    kwargs['ng-' + key[3:]] = kwargs.pop(key)
            return super(AngularJSClass, self).__call__(field, **kwargs)

    return AngularJSClass


class DataForm(Form):
    """
    Input field for test {widget=AngularJSClass(TextInput}.
    """
    name = StringField('What is your name?',
                       validators=[DataRequired()],
                       widget=get_angularjs_class(TextInput)())
    location = StringField('What is your location?',
                           validators=[DataRequired()],
                           widget=get_angularjs_class(TextInput)())
    submit = SubmitField('Submit')
