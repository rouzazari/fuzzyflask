import json
from io import StringIO

import pandas as pd
from fuzzywuzzy import process


def process_dataset(dataset, dictionary):
    data = StringIO(dataset)
    df = pd.read_csv(data, header=None, names=['data'])
    dict_split = dictionary.split('\n')
    df['match'], df['score'] = zip(*df['data'].apply(dictionary_match,
                                                     args=(dict_split, True)))
    return pd_to_json(df)


def pd_to_json(df):
    return json.dumps(df.to_dict(orient='records'))


def dictionary_match(item, dictionary,
                     allow_low_match=False, low_match_threshold=90):
    if item in dictionary:
        return item, 100
    matched_item, score = process.extractOne(item, dictionary)
    print("{} => {}".format(item, matched_item))
    if score < low_match_threshold and not allow_low_match:
        return item, score
    else:
        return matched_item, score
