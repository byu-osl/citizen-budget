#!/usr/bin/python
#
# Copyright 2012 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import httplib2
import sys
from apiclient.discovery import build
from oauth2client.file import Storage
from oauth2client.client import AccessTokenRefreshError
from oauth2client.client import OAuth2WebServerFlow
from oauth2client.tools import run
from apiclient.http import MediaFileUpload

# For this example, the client id and client secret are command-line arguments.
#client_id = "796457455883.apps.googleusercontent.com"
#client_secret = "2YY_4DRbuxwySfYTv7ijxwqj"

client_id = "796457455883-928d42p0tf0n9720goi6gmqululhqcpf.apps.googleusercontent.com"
client_secret = "hYQZRmxogtng3KCa5_E_w9k0"
table_id = "1qrXUrlwMlihxJiBDLcLQFE5w-4lvrR3YWcuj2EE"

# The scope URL for read/write access to a user's calendar data
scope = 'https://www.googleapis.com/auth/fusiontables'

# Create a flow object. This object holds the client_id, client_secret, and
# scope. It assists with OAuth 2.0 steps to get user authorization and
# credentials.
flow = OAuth2WebServerFlow(client_id, client_secret, scope)

def main(fund_name , year , ytd_total_revenues , ytd_total_expenditures , total_budget , total_budgeted_expenditures , net_revenue_over_expenditures , notes):

  # Create a Storage object. This object holds the credentials that your
  # application needs to authorize access to the user's data. The name of the
  # credentials file is provided. If the file does not exist, it is
  # created. This object can only hold credentials for a single user, so
  # as-written, this script can only handle a single user.
  storage = Storage('fusiontables.dat')

  # The get() function returns the credentials for the Storage object. If no
  # credentials were found, None is returned.
  credentials = storage.get()

  # If no credentials are found or the credentials are invalid due to
  # expiration, new credentials need to be obtained from the authorization
  # server. The oauth2client.tools.run() function attempts to open an
  # authorization server page in your default web browser. The server
  # asks the user to grant your application access to the user's data.
  # If the user grants access, the run() function returns new credentials.
  # The new credentials are also stored in the supplied Storage object,
  # which updates the credentials.dat file.
  if credentials is None or credentials.invalid:
    credentials = run(flow, storage)

  # Create an httplib2.Http object to handle our HTTP requests, and authorize it
  # using the credentials.authorize() function.
  http = httplib2.Http()
  http = credentials.authorize(http)

  # The apiclient.discovery.build() function returns an instance of an API service
  # object can be used to make API calls. The object is constructed with
  # methods specific to the calendar API. The arguments provided are:
  #   name of the API ('calendar')
  #   version of the API you are using ('v3')
  #   authorized httplib2.Http() object that can be used for API calls
  service = build('fusiontables', 'v1', http=http)
  #resource = service.query()
  resource = service.table()
  
  outsql = "INSERT INTO "+table_id+" (fund_name , year , ytd_total_revenues , ytd_total_expenditures , total_budget , total_budgeted_expenditures , net_revenue_over_expenditures , notes) VALUES " + "("+ fund_name +","+ year +","+ ytd_total_revenues +","+ ytd_total_expenditures +","+ total_budget +","+ total_budgeted_expenditures +","+ net_revenue_over_expenditures +","+ notes+")"
  
  #request = resource.sql(sql=outsql)
  media = MediaFileUpload("junk.csv", mimetype="application/octet-stream")
  request = resource.importRows(tableId=table_id, media_body=media)
  
  response = request.execute()
  
  print response
  
if __name__ == '__main__':
  #fund_name , year , ytd_total_revenues , ytd_total_expenditures , total_budget , total_budgeted_expenditures , net_revenue_over_expenditures , notes
  main("'General Fund'", "2012", "1234", "12344", "12341234", "123412341234", "1234", "''" )
