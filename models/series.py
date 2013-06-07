import json

class Series:
    def __init__(self):
        self.series = []

    def jsonify(self):
        return json.dumps(self.series)

    def add(self,data):
        self.series.append(data.data)

class Data:
    def __init__(self,label=''):
        self.data = {}
        self.data['data'] = []
        self.data['label'] = label

    def add(self,d):
        self.data['data'].append(d)

    def color(self,name):
        self.data['color'] = name

    def reverse(self):
        self.data['data'].reverse()
