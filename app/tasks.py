import random
from io import StringIO

import pandas as pd

from . import celery
from app.main.datatools import dictionary_match

REFRESH_THRESHOLD = 0.10


@celery.task(bind=True)
def match_task(self, dataset, dictionary):
    # set up dataframe
    data = StringIO(dataset)
    df = pd.read_csv(data, header=None, names=['data'])
    df['match'] = ''
    df['score'] = ''
    total = len(df)
    # get dictionary
    dict_split = dictionary.split('\n')
    message = ''
    # iterate through rows and update task state for polling
    for i, row in df.iterrows():
        row['match'], row['score'] = dictionary_match(row['data'], dict_split)
        if not message or random.random() < REFRESH_THRESHOLD:
            message = df.to_dict(orient='records')
        self.update_state(state='PROGRESS',
                          meta={'current': int(i+1),
                                'total': total,
                                'status': message})
    return {'current': total, 'total': total, 'status': df.to_dict(orient='records'),
            'result': df.to_dict(orient='records')}
