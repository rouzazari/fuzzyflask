from flask import render_template
from flask import request

from . import main
from .forms import DataForm
from .datatools import process_dataset


@main.route('/')
def index():
    data_form = DataForm()
    return render_template('index.html', data_form=data_form)


@main.route('/match', methods=['POST'])
def match():
    # TODO: make return asynchronous (takes too long)
    # TODO: add a status feature (show % or number done)
    # TODO: display table, then show results as calculated (asynchronously)
    form_data = request.form['dataset']
    form_dictionary = request.form['dictionary']
    return process_dataset(form_data, form_dictionary)
