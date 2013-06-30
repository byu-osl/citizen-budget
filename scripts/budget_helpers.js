/*!
 ****************************************************************************
 * Look at Cook Budget Helpers library
 * http://lookatcook.com/
 *
 * Copyright 2012, Derek Eder and Nick Rougeux
 * Licensed under the MIT license.
 * https://github.com/open-city/look-at-cook/wiki/License
 *
 * Date: 3/24/2012
 *
 * Helpers called by BudgetLib
 * 
 ****************************************************************************/

var BudgetHelpers = BudgetHelpers || {};  
var BudgetHelpers = 
{
  //***************************************************************************
  // This funciton will return the current year. Example: 2013
  //***************************************************************************
  getCurrentYear: function()
  {
    var date = new Date();
    return date.getFullYear();
  },
  
  //***************************************************************************
  //***************************************************************************
  query: function(sql, callback) 
  {  
    var sql = encodeURIComponent(sql);
    $.ajax({
      url: "https://www.googleapis.com/fusiontables/v1/query?sql="+sql     
            +"&callback="+callback+"&key="+BudgetLib.CB_FusionTableApiKey, 
      dataType: "jsonp"
      
    });
  },

  //***************************************************************************
  //***************************************************************************
  handleError: function(json) 
  {
    if (json["error"] != undefined)
      console.log("Error in Fusion Table call: " + json["error"]["message"]);
  },
	
  //***************************************************************************
  //converts SQL query to URL
  //***************************************************************************
  getQuery: function(query) 
  {
    return query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq='
						  + encodeURIComponent(query));
  },
  
  //***************************************************************************
  //converts a Fusion Table json response in to an array for passing in to highcharts
  //***************************************************************************
  getDataAsArray: function(json) 
  {
    var data = json["rows"][0]; 
    var dataArray = [];
    var lastItem  = 0;
    for(var i=0; i<data.length; i++) 
    { 
      dataArray[i] = +data[i];
      lastItem = i;
    }

    //For the most recent year, we usually don't have expenditures. 
    //By setting the last year to null when 0, Highcharts just truncates the line.
    if (dataArray[lastItem] == 0) dataArray[lastItem] = null;
    
    return dataArray;
  },

  //***************************************************************************
  //This function will take in a table of the formate:
  // (catigory_name, ytd_act, ...)
  // And return an array with:
  // [ [Array of catigory_name], [Array of total ytd_actual]]
  //**************************************************************************
  genArrayOfCatigoriesAndActuals: function(json)
  {
    var rows = json["rows"];
    var catigories = [];
    var data = [];
    
    for(i = 0; i < rows.length; i++)
    {
      catigories.push("" + rows[i][0]);
      data.push(rows[i][1]);
    }
        
    return [catigories, data];
  },
  
  //***************************************************************************
  //***************************************************************************
  getAddressLink: function(year, fund, title) 
  {
    var href = "/?year=" + year + "&amp;fund=" + fund;
  	return ("<a class='adr' href='" + href + "' rel='address:" + href + "'>"
		+ title + "</a>");
  },
  
  //***************************************************************************
  //***************************************************************************
  generateTableRow: function(rowId, detailLoadFunction, rowName, budgeted, spent) 
  {
    return "\
      <tr id='" + rowId + "'>\
        <td>\
        <a onclick='" + detailLoadFunction + "'></a>&nbsp;<a onclick='"
		      + detailLoadFunction + "'>" + rowName + "</a>\
        </td>\
        <td class='num spent'>" + spent + "</td>\
        <td class='num budgeted'>" + budgeted + "</td>\
      </tr>";
  },
  
  //***************************************************************************
  //***************************************************************************
  generateBreakdownTableRow: function(rowId, rowName, budgeted, spent, note, fusiontableRowid) 
  {
    var row = "\
      <tr id='" + rowId + "'>\
        <td>" + rowName;
    
    if (note != "") {
      row += "  <img onclick=\"BudgetLib.showBreakDownNote(" + fusiontableRowid +
      ")\" alt=\"Cedar Hills City Budget\" src=\"images/bubble.png\" height=\"15\" />";
    }
    
    row += "</td>\
        <td class='num spent'>" + spent + "</td>\
        <td class='num budgeted'>" + budgeted + "</td>\
      </tr>";
    
    return row;
  },
  
  //***************************************************************************
  //converts a text in to a URL slug
  //***************************************************************************
  convertToSlug: function(text) {
    if (text == undefined) return '';
  	return (text+'').replace(/\//g,"_").replace(/ /g,'-').replace(/[^\w-]+/g,'');
  },
  
  //***************************************************************************
  //converts text to a formatted query string
  //***************************************************************************
  convertToQueryString: function(text) {
  	if (text == undefined) return '';
  	return (text+'').replace(/\-+/g, '+').replace(/\s+/g, '+');
  },
  
  //***************************************************************************
  //converts a slug or query string in to readable text
  //***************************************************************************
  convertToPlainString: function(text) {
    if (text == undefined) return '';
  	return (text+'').replace(/_/g,'/').replace(/\++/g, ' ').replace(/\-+/g, ' ');
  },

  //***************************************************************************
  //NOT USED for debugging - prints out data in a table
  //***************************************************************************
  getDataAsTable: function(json) 
  {
    var rows = json["rows"];
    var cols = json["columns"];
    
    //concatenate the results into a string, you can build a table here
    var fusiontabledata = "<table><tr>";
    for(i = 0; i < cols.length; i++) {
      fusiontabledata += "<td>" + cols[i] + "</td>";
    }
    fusiontabledata += "</tr>";
    
    for(i = 0; i < rows.length; i++) {
    	fusiontabledata += "<tr>";
      for(j = 0; j < cols.length; j++) {
        fusiontabledata += "<td>" + rows[i][j] + "</td>";
      }
      fusiontabledata += "</tr>";
    }
    fusiontabledata += "</table>";  
    console.log(fusiontabledata);
  }
}
