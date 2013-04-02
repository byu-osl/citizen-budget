###############################################################################
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
###############################################################################

import httplib2
import sys
from apiclient.discovery import build
from oauth2client.file   import Storage
from oauth2client.client import AccessTokenRefreshError
from oauth2client.client import OAuth2WebServerFlow
from oauth2client.tools  import run
from apiclient.http      import MediaFileUpload

###############################################################################
# Citizen Budget
# Authors: Christopher LaJon Morgan, Eric Lazalde
#
# The purpose of this utitlity is to read data from a csv file into
# the appropiate google fusion table.
###############################################################################

client_id     = "796457455883-928d42p0tf0n9720goi6gmqululhqcpf.apps.googleusercontent.com"
client_secret = "hYQZRmxogtng3KCa5_E_w9k0"
scope         = 'https://www.googleapis.com/auth/fusiontables'

tableIndexDescription = "Table Index: 0 -- FUNDS, 1 -- FundBreakDownCategory"
table_id              = ("1qrXUrlwMlihxJiBDLcLQFE5w-4lvrR3YWcuj2EE",#FUND TABLE
                         "1WAx1a_FduyZIme5LG2LwkLgoqKfXahlagTctJ_o")#FundBreakDownCategory TABLE
###############################################################################
# Main
# This function will authenticate with google fushion api, using OAuth 2.0.
# If a user has not give permission to this application yet, a brower will
# be opened and prompt the user for access.
# Once the app has authenticated it will insert row into the specified
# fushion table.  The data imported will be from the specified csv file.
#
# filename --> CSV file containning the data to import into the fushion table.
# tableIndex --> Indicates which table to upload the data to.
###############################################################################
def main(filename, tableIndex):

  flow = OAuth2WebServerFlow(client_id, client_secret, scope)
  
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
  # methods specific to the fushion table API. The arguments provided are:
  #   name of the API ('fusiontalbes')
  #   version of the API you are using ('v1')
  #   authorized httplib2.Http() object that can be used for API calls
  service  = build('fusiontables', 'v1', http=http)
  resource = service.table()
    
  media    = MediaFileUpload(filename, mimetype="application/octet-stream")
  request  = resource.importRows(tableId=table_id[tableIndex], media_body=media)
  
  response = request.execute()
  
  if "numRowsReceived" in response:
    print "\n", response["numRowsReceived"], " Row(s) were successfully inserted.\n"
  else:
    print response

###############################################################################
# Command Line
# Accepts the file name and table index in order to insert rows into
# the given fusion table.
###############################################################################  
if __name__ == '__main__':
  if len(sys.argv) != 3 or int(sys.argv[2]) < 0 or int(sys.argv[2]) > 1:
    print "\nUSAGE: \tuploadCsvToFushion <file.csv> <table_index=\"0 or 1\">"
    print "\t", tableIndexDescription, "\n"
  else:
    main(sys.argv[1], int(sys.argv[2]))
