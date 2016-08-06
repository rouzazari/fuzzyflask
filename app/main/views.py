from flask import render_template
from flask import request

from . import main
from .forms import DataForm


@main.route('/')
def index():
    data_form = DataForm()
    return render_template('index.html', data_form=data_form)


@main.route('/match', methods=['POST'])
def match():
    import json
    form_values = dict(name=request.form['name'],
                       location=request.form['location'])
    return json.dumps(form_values)
