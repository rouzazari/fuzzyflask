from flask import (jsonify,
                   make_response,
                   render_template,
                   request,
                   url_for,
                   )

from . import main
from .forms import DataForm
from .datatools import process_dataset
from ..tasks import match_task


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


@main.route('/match_async', methods=['POST'])
def match_async():
    form_data = request.form['dataset']
    form_dictionary = request.form['dictionary']
    task = match_task.apply_async(args=[form_data, form_dictionary])
    resp = make_response(jsonify({}), 202)
    resp.headers['Location'] = url_for('main.match_status', task_id=task.id)
    return resp


@main.route('/match_status/<task_id>')
def match_status(task_id):
    # adapted from http://blog.miguelgrinberg.com/post/using-celery-with-flask
    task = match_task.AsyncResult(task_id)
    if task.state == 'PENDING':
        response = {
            'state': task.state,
            'current': 0,
            'total': 1,
            'status': 'Pending...'
        }
    elif task.state != 'FAILURE':
        response = {
            'state': task.state,
            'current': task.info.get('current', 0),
            'total': task.info.get('total', 1),
            'status': task.info.get('status', '')
        }
        if 'result' in task.info:
            response['result'] = task.info['result']
    else:
        response = {
            'state': task.state,
            'current': 1,
            'total': 1,
            'status': str(task.info)
        }
    return jsonify(response)
