import json

class Series:
    def __init__(self):
        self.series = []

    def jsonify(self):
        return json.dumps(self.series)

    def add(self,data):
        self.series.append(data.data)

class Data:
    def __init__(self,label='', hoverable=True):
        self.data = {}
        self.data['data'] = []
        self.data['label'] = label
        self.data['hoverable'] = hoverable

    def add(self,d):
        self.data['data'].append(d)

