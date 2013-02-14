#!/usr/bin/python
#
# Copyright (C) 2011 Google Inc.

""" Demostrates use of the new Fusion Tables API

"""

import urllib2, urllib, simplejson, sys, httplib

# To generate values for the variables below:
# 1. Go to code.google.com/apis/console
# 2. Turn on the Fusion Tables API
# 3. Accept the terms
# 4. Click API Access in left-hend nav
# 5. api_key is under "Simple API Access"
# 6. Click "Create an OAuth 2.0 client ID..." to get the client_id and client_secret
# 7. Enter a product name.. this can be anything.
# 8. Select Installed Application
# 9. client_id, client_secret, and redirect_uri are available now (use http://localhost for redirect uri)
# 10. Enter a table id of a table you own
# 11. To run the code, from command line in the directory containing the file, type python infowindow_styling_demo.py

client_id = "796457455883.apps.googleusercontent.com"
client_secret = "2YY_4DRbuxwySfYTv7ijxwqj"
redirect_uri = "http://localhost"
api_key = "AIzaSyBiDIkXJCdmnUQoyGQNcUXVLj0i35nAk90"
tableid = "1qrXUrlwMlihxJiBDLcLQFE5w-4lvrR3YWcuj2EE"

class RunAPITest:
  def __init__(self):
    self.access_token = ""
    self.params = ""

  def main(self):
    print "copy and paste the url below into browser address bar and hit enter"
    print "https://accounts.google.com/o/oauth2/auth?%s%s%s%s" % \
      ("client_id=%s&" % (client_id),
      "redirect_uri=%s&" % (redirect_uri),
      "scope=https://www.googleapis.com/auth/fusiontables&",
      "response_type=code")

    code = raw_input("Enter code (parameter of URL): ")
    data = urllib.urlencode({
      "code": code,
      "client_id": client_id,
      "client_secret": client_secret,
      "redirect_uri": redirect_uri,
      "grant_type": "authorization_code"
    })

    serv_req = urllib2.Request(url="https://accounts.google.com/o/oauth2/token",
       data=data)

    serv_resp = urllib2.urlopen(serv_req)
    response = serv_resp.read()
    tokens = simplejson.loads(response)
    access_token = tokens["access_token"]
    self.access_token = access_token
    self.params = "?key=%s&access_token=%s" % \
      (api_key, self.access_token)

  def getStyles(self):
    print "GET STYLES"
    self.runRequest(
      "GET",
      "/fusiontables/v1/tables/%s/styles%s" % \
        (tableid, self.params))

  def getStyle(self, styleId):
    print "GET STYLE"
    self.runRequest(
      "GET",
      "/fusiontables/v1/tables/%s/styles/%d%s" % \
        (tableid, styleId, self.params))

  def insertStyle(self, color):
    print "INSERT STYLE"
    data = '''{
      "name": "myfirststyle",
      "tableId": %s,
      "markerOptions": {
        "iconName": "%s"
      }
    }''' % (tableid, color)
    response = self.runRequest(
      "POST",
      "/fusiontables/v1/tables/%s/styles%s" % \
        (tableid, self.params),
      data,
      headers={'Content-Type':'application/json'})
    json_response = simplejson.loads(response)
    return json_response["styleId"]

  def updateStyle(self, styleId):
    print "UPDATE STYLE"
    data = '''{
      "styleId": %d,
      "name": "myfirststyle",
      "tableId": %s,
      "markerOptions": {
        "iconName": "small_red"
      }
    }''' % (styleId, tableid)
    self.runRequest(
      "PUT",
      "/fusiontables/v1/tables/%s/styles/%d%s" % \
        (tableid, styleId, self.params),
      data,
      headers={'Content-Type':'application/json'})

  def deleteStyle(self, styleId):
    print "DELETE STYLE"
    self.runRequest(
      "DELETE",
      "/fusiontables/v1/tables/%s/styles/%d%s" % \
        (tableid, styleId, self.params))

  def getTemplates(self):
    print "GET TEMPLATES"
    self.runRequest(
      "GET",
      "/fusiontables/v1/tables/%s/templates%s" % \
        (tableid, self.params))

  def getTemplate(self, templateId):
    print "GET TEMPLATE"
    self.runRequest(
      "GET",
      "/fusiontables/v1/tables/%s/templates/%d%s" % \
        (tableid, templateId, self.params))

  def insertTemplate(self):
    print "INSERT TEMPLATE"
    data = '''{
      "tableId": %s,
      "name": "mytemplate",
      "isDefaultForTable": true,
      "body": "<p>this is a name: {name}</p>"
    }''' % (tableid)
    response = self.runRequest(
      "POST",
      "/fusiontables/v1/tables/%s/templates%s" % \
       (tableid, self.params),
      data,
      headers={'Content-Type':'application/json'})
    json_response = simplejson.loads(response)
    return json_response["templateId"]

  def updateTemplate(self, templateId):
    print "UPDATE TEMPLATE"
    data = '''{
      "tableId": %s,
      "templateId": %d,
      "name": "mytemplate",
      "isDefaultForTable": true,
      "body": "<p>this is not a name: {name}</p>"
    }''' % (tableid, templateId)
    self.runRequest(
      "PUT",
      "/fusiontables/v1/tables/%s/templates/%d%s" % \
        (tableid, templateId, self.params),
      data,
      headers={'Content-Type':'application/json'})

  def deleteTemplate(self, templateId):
    print "DELETE TEMPLATE"
    self.runRequest(
      "DELETE",
      "/fusiontables/v1/tables/%s/templates/%d%s" % \
        (tableid, templateId, self.params))

  def runRequest(self, method, url, data=None, headers=None):
    request = httplib.HTTPSConnection("www.googleapis.com")

    if data and headers: request.request(method, url, data, headers)
    else: request.request(method, url)
    response = request.getresponse()
    print response.status, response.reason
    response = response.read()
    print response
    return response


if __name__ == "__main__":
  api_test = RunAPITest()
  api_test.main()

  api_test.getStyles()
  styleId = api_test.insertStyle("large_red")
  api_test.getStyle(styleId)
  api_test.updateStyle(styleId)
  api_test.deleteStyle(styleId)

  api_test.getTemplates()
  templateId = api_test.insertTemplate()
  api_test.getTemplate(templateId)
  api_test.updateTemplate(templateId)
  api_test.deleteTemplate(templateId)
