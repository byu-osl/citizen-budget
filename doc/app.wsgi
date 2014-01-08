import os
import sys

PROJECT_DIR = '/home/www/budget.cedarhills.org/citizen-budget'

activate_this = os.path.join(PROJECT_DIR, 'env/bin', 'activate_this.py')
execfile(activate_this, dict(__file__=activate_this))
sys.path.append(PROJECT_DIR)

from app import app as application
