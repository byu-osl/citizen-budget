from flask import Blueprint, send_from_directory

### City Resources ### 

city = Blueprint('city', __name__)

@city.route('/<directory>/<filename>')
def get(directory,filename):
    return send_from_directory('cities/' + directory, filename)
