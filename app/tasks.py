import random

from . import celery
from app.main.datatools import dictionary_match

REFRESH_THRESHOLD = 0.10


@celery.task(bind=True)
def match_task(self, dataset, dictionary):
    # set up dataframe
    data_split = dataset.split('\n')
    total = len(data_split)
    # get dictionary
    dict_split = dictionary.split('\n')
    message = ''
    d_all = []
    # iterate through rows and update task state for polling
    for i, row in enumerate(data_split):
        match, score = dictionary_match(row, dict_split, allow_low_match=True)
        d = dict(data=row, match=match, score=score, selected=score > 90)
        d_all.append(d)
        self.update_state(state='PROGRESS',
                          meta={'current': int(i+1),
                                'total': total,
                                'status': 'working'})
        #print(d)
    return {'current': total, 'total': total, 'status': 'COMPLETE',
            'result': d_all}
