citizen-budget
==============

A budget visualization tool for local governments.

Based on Look at Cook

A budget transparency visualization for Cook County, IL (Chicago's county) displaying all county departments broken down by fund and control officer from 1993 to 2011. Done as a collaboration with Cook County Commissioner John Fritchey.

Dependencies
------------

- [jQuery](http://jquery.com)
- [Google Fusion Tables v1 API](https://developers.google.com/fusiontables/docs/v1/getting_started)
- [jQuery Address](http://www.asual.com/jquery/address/) (for RESTful URLs)
- [Highcharts](http://www.highcharts.com/) (for the line graph)

Overview
--------

This budget visualization is built entirely using HTML and jQuery. There is no server-side code, except for the stuff that happens behind the scenes with Google Fusion Tables. Even so, the data is fetched from Fusion Tables using the javascript Google Visualization API.

The bulk of the code is in /scripts/budget_lib.js. This file contains all of the init, data fetching, display and helper functions that the visualization uses to run. To get a good idea of how it works, you should first look at the data in Fusion Tables that it uses:

 - [Main fund table](https://www.google.com/fusiontables/DataSource?docid=1WAx1a_FduyZIme5LG2LwkLgoqKfXahlagTctJ_o) (expenditures and appropriations per fund per year)
 - [Fund descriptions](https://www.google.com/fusiontables/DataSource?docid=1qrXUrlwMlihxJiBDLcLQFE5w-4lvrR3YWcuj2EE)
 - [Fund Break Down Items](https://www.google.com/fusiontables/DataSource?docid=1WAx1a_FduyZIme5LG2LwkLgoqKfXahlagTctJ_o) (Line items per fund per year)

The data is read from these tables and the appropriate content on the page is updated via asynchronous callback (for more info on callbacks see: http://docs.jquery.com/Tutorials:How_jQuery_Works#Callback_and_Functions). Whenever a chart point or link are clicked or the URL changes, the jQuery address code detects the change and updates the page using the 'updateDisplay' function. Through the fund parameter, two views are loaded onto the page.  In other words, the index.html page supports two pages, or views.  One view is for the main over all budget, and the other view is for a specific fund.  If there is no fund specified then the main page is loaded, however, if a fund is specfied the fund page is loaded.

The appropriations and expenditures per year are then fetched based on the view using the 'getTotalArray' which in turn updates the main chart (which uses Highcharts) via 'updateMainChart'. 

When a row is clicked, the details for that fund are fetch and the page transitions to the fund view.

General Flow
------------
- URL Change -> budgetLib.UpdateDisplay --|
-                                         |-> budgetLib.LoadMainPage -> budgetLib.UpdateMainPage
-                                         |
-                                         |-> budgetLib.LoadFundPage -> busgetLib.UpdateFundPage

Both update methods then call function in the BudgetQuery file.  This file generate the sql queries
used to pull data from the fusion tables.  Via passed in call back function the json data is returned
to method in the BudgetLib file.  The methods in the BudgetLib then parse the json if needed and
populate the page with the aquired information.


Explaination of Files
------------
- BudgetLib -- Main: This is the main driver for the application.  It drives the feting, loading, and display of data.
- BudgetQueries -- This file contains all of the sql queries required to retrive data from the fushion tables.
- BudgetHelpers -- This file contain misilanious helper functions to create url slugs, generate tables, and perform other functions.
- BudgetHighCharts -- This file contains code to generate and render the line graph and bar charts.

How to Step up the System
------------
==Generate Auth Token==
- 1. https://code.google.com/apis/console/
- 2. Create Project
- 3. Services > Google Fusion Table API | Turn on Google Fusion API
- 4. Accept Terms
- 5. API Access | Create and Auth 2.0 Client ID
- - Enter info
- - Select Web Application
- - Your site or host name select more options:
- - Authorized java origins enter : https://localhost
- - Authorized Redirect URL enter: https://localhost/oauth2callback http://localhost:8080/
- 6. Copy client secret and client id into uploader script

==Obtain Google API Key==
- 1. Follow direction in Generate Auth Token up to step 4.
- 2. Navigate to API Access
- 3. Copy API key and add it to BudgetLib

==Generating Fusion Tables==
- 1. Log in with you Google Account
- 2. Navigate to each of the Fusion Tables
- 3. Select Copy table.
- 4. Share file with anyone on the web.
- 5. Rename Table
- 6. Get table ID: File > About this Table
- 7. Copy table ID to uploader and budgetLib files

Known issues
------------

 - Search engines: Because this is an AJAX application, the data that is displayed is NOT crawlable by search engines. I would love to fix this. See http://code.google.com/web/ajaxcrawling/docs/specification.html for more info
 - Special characters: Some of the data elements I'm filtering on don't have proper IDs or slugs in my Fusion Table. This results in the visualization not supporting special characters (anything that a URL wouldn't like) in the Fund and Control Officer name fields. Departments are ok because they each have a unique ID. I'd recommend using IDs for everything if you plan on making your own budget visualization.

Errors / bugs
-------------

If something is not behaving intuitively, it is a bug, and should be reported.
Report it here: https://github.com/byu-osl/citizen-budget/issues


Copyright
---------

Copyright (c) 2012 Derek Eder and Nick Rougeux. Released under the MIT License.

See LICENSE for details https://github.com/open-city/look-at-cook/wiki/License
