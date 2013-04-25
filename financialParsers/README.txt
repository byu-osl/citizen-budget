//////////////////////////////////////////////////////////
// The Financial Parser Project
// --This is simple a project to parse Cedar Hills
// --financial documents into two google fusion tables.
//////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////
// UPLOADER
//////////////////////////////////////////////////////////
The purpose of the uploader is to upload a csv file into google fusion tables.
The usage of this file is discoverable by simply running the script.
"python uploadCsvToFusion.py"

General Discription:
The csv files are created to mimic the fusion table exactly.
Every line in the file represents a new row to be added to the fusion table, and
every line has an entry for each column in the table.  Thus the mapping between
csv and fusion table is basically one to one.

Script:
This script uses a google Auth token to gain access to the appropriate fusion tables.
The script works correctly when a user physically modifies the client_id and client_secret
variables in the .py script.  This will point the script to the correct user account
inwhich to obtain the auth token.

A new user of the script will also need to modify the table_id tuple.  This tuple
contains the table id's for the fusion table to be uploaded to. There is one
for each table the script is able to upload data to.

Usage:
The user will run the script with the appropriate file and table id.  The script
will open a web brower, or a new tab in an existing browser, and ask the user
to authenticate with google.  The script will then gain access to the fusion tables
and will upload all of the data in the specified file.
The script will then report all of the rows that were successfully uploaded into the 
fusion table.
