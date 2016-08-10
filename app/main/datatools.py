from fuzzywuzzy import process


def dictionary_match(item, dictionary,
                     allow_low_match=False, low_match_threshold=90):
    if item in dictionary:
        return item, 100
    matched_item, score = process.extractOne(item, dictionary)
    if score < low_match_threshold and not allow_low_match:
        return item, score
    else:
        return matched_item, score
