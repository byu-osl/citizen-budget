/*!
 ***************************************************************************
 * This code was derived from the LOOK AT COOK PROJECT:
 *
 * Look at Cook Budget Display library
 * http://lookatcook.com/
 *
 * Copyright 2012, Derek Eder and Nick Rougeux
 * Licensed under the MIT license.
 * https://github.com/open-city/look-at-cook/wiki/License
 *
 * Date: 3/24/2012
 *
 * This is where all the 'magic' happens. jQuery address detects changes in the URL, and 
 * calls the 'BudgetLib.updateDisplay' function which displays the appropriate data for that view.
 * 
 * Data is stored in Google Fusion tables, and fetches it using the Google visualization API
 * 
 * For display, the data is passed to Highcharts, another javascript library that specializes 
 * in graphs, and an HTML table which displays the budget broken down by department.
 * 
 * Every fund or department that is clicked updates the URL query string using 
 * jQuery Address and the page loads the data dynamically.
 ****************************************************************************/

/******************************************************************************
 * Citzen Budget
 * Director/Author:  Daniel Zappala
 * Authors:          Christopher Morgan,
 *                   Eric Lazaldie,
 *                   Dallin Smith
 *
 * This file is broken down into four sections:
 * 1) The main driver: updateDisplay
 * 
 * 2) Common code:  This is code shared by two virtual pages.  The fund page
 *                  and the main page.  We say virtual becuase they both end
 *                  up being displayed in the index.html, but they are
 *                  logically different pages.
 *                  
 * 3) Main Page:    This section contains code that will display the cities main
 *                  budget/spent information.
 *                  
 * 4) Fund Page:    This section contains code that will display the budget/spent
 *                  information for a cities fund over the years.
 ******************************************************************************/

var BudgetLib = BudgetLib || {};  
var BudgetLib = {
  
  //Citizen Budget Keys: IDs used to reference and access Fusion Tables, where the data is stored.
  CB_FusionTableApiKey:         "AIzaSyBiDIkXJCdmnUQoyGQNcUXVLj0i35nAk90",
  CB_FUND_TABLE_ID:             "1qrXUrlwMlihxJiBDLcLQFE5w-4lvrR3YWcuj2EE",
  CB_FUND_BREAK_DOWN_TABLE_ID:  "1WAx1a_FduyZIme5LG2LwkLgoqKfXahlagTctJ_o",
  CB_FUND_DESCRIPTION_TABLE_ID: "1HKXIvUWkx7W1R9YG0qsLnkCBCnsSj3CeMVeLHF8",
  
  // ecl This is the title that will show up to the left of the budget/spent blocks and under the graph.
  title:        "BUDGET",
  scTitle:      "Cedar Hills City Budget",
  loadYear:     undefined,
  dateYearOnly: true,                         //True == Only Show Year in HighCharts 

  
  
  
  //-------------front end display functions-------------------
  
  //***************************************************************************
  // Update Display -- MAIN -- The Driver -- It all Starts HERE -- 
  //
  // This function will perform inital setup and then follow two paths.
  // 1) Dispaly the Main page.
  // or
  // 2) Display a Fund page.
  //***************************************************************************
  updateDisplay: function(year, fund, externalLoad) 
  {
    $("#main-page").fadeOut();
    //Initalize loadYear if Needed
    if (BudgetLib.loadYear == undefined)
    {
      BudgetLib.setLoadYear();
      return;
    }
    
    //Set Load Year 
    if (year != null && year != "")
      BudgetLib.loadYear = BudgetHelpers.convertToPlainString(year);

    BudgetHighcharts.updateExpenditurePie();
      
    // !!! Main Swith !!! -- Load Main Page or Fund Page --
    if (fund != undefined && fund != "")
      BudgetLib.loadFundPage(BudgetHelpers.convertToPlainString(fund), externalLoad);
    else
      BudgetLib.loadMainPage(externalLoad);
  },  
  
  //--------------------------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  // Common Code:: Code Shared by Both the Main Page and the Fund Page
  //--------------------------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------

  //***************************************************************************
  // This function will Fire off a request to get all the date stored in
  // the fusion Fund table.  It will then set a call back to update
  // the load year to the most recent year found.
  //***************************************************************************
  setLoadYear: function()
  {
    BudgetQueries.getDates("BudgetLib.updateLoadYear");
  },
  
  //***************************************************************************
  //***************************************************************************
  updateHeader: function(view, subtype){
    $('h1').html(view);
    if (view != BudgetLib.title) {
      $('#breadcrumbs').html("<a href='/?year=" + BudgetLib.loadYear + "' rel='address:/?year=" + BudgetLib.loadYear + "'>&laquo back to " + BudgetLib.title + "</a>");
      $("#breakdown-nav").html("");
    }
    else
      $('#breadcrumbs').html("");
    
    $('#secondary-title').html((BudgetLib.dateYearOnly ? BudgetLib.loadYear.split("/")[2]: BudgetLib.loadYear)
                               + ' ' + BudgetLib.scTitle);
    $('#breakdown-item-title span').html(subtype);
  },
  

  // ---------------- Display Call Back Functions --------------------------
  
  //these all work by being called (callback function) once Fusion Tables returns a result. 
  //the function then takes the json and handles updating the page
  updateAppropTotal: function(json) {
    BudgetLib.appropTotalArray = BudgetHelpers.getDataAsArray(json);
    BudgetHighcharts.updateMainChart();
  },
  
  updateExpendTotal: function(json) {
    BudgetLib.expendTotalArray = BudgetHelpers.getDataAsArray(json);
    BudgetHighcharts.updateMainChart();
  },
  
  //***************************************************************************
  //CallBack Funciton
  //This generate three arrays:
  // 1) A dates array
  // 2) A total_budgeted array
  // 3) a toal_spend array
  // It will then update appropTotalArray, expendTotalArray, and the dates
  // array with the new information.  It will then update the main chart.
  //***************************************************************************  
  updateTotals: function(json)
  {
    var rows           = json["rows"];
    var dates          = new Array();
    var expenditures   = new Array();
    var appropreations = new Array();
    
    //Populate dates, expenditures, and appropreations
    if (rows != undefined)
    {
      for (var r = 0; r < rows.length; r++)
      {
        dates.push(rows[r][0]);
        expenditures.push(rows[r][1]);
        appropreations.push(rows[r][2]);
      }
    }
    
    //Update Arrays
    BudgetLib.appropTotalArray = appropreations;
    BudgetLib.expendTotalArray = expenditures;
    BudgetLib.dates            = dates;
       
    BudgetHighcharts.updateMainChart();
  },
  
  //***************************************************************************
  // This function will update the load year to the most recent year found
  // in the Fund fusion table. If the load year is currently null it will
  // also recall updateDisplay.
  //***************************************************************************
  updateLoadYear: function(json)
  {
    var len             = json["rows"].length - 1 ;
    var mostRecentYear  = json["rows"][len][0];
    var currentLoadYear = BudgetLib.loadYear;
    
    //Update loadYear
    BudgetLib.loadYear = mostRecentYear;
    
    if (currentLoadYear == undefined)
      BudgetLib.updateDisplay(undefined, undefined, true);
    
  },
  
  //***************************************************************************
  //shows the description of the current view below the main chart
  //***************************************************************************
  updateScorecardDescription: function(json)
  { 
    var rows = json["rows"];
    var cols = json["columns"];
    
    if(rows != undefined)
    {
      if (rows.length > 0)
        $('#scorecard-desc p').hide().html(rows[0][0]).fadeIn();
    }
    else
      $('#scorecard-desc p').fadeOut(300);
  },
  
  //***************************************************************************
  //shows totals and percentage changes of the current view below the main chart
  //***************************************************************************
  updateScorecard: function(json)
  {   
    var rows = json["rows"];
    var cols = json["columns"];
    if (rows.length > 0)
    {
      $('#scorecard-budgeted').fadeOut('fast', function(){
        $('#scorecard-budgeted').html(rows[0][0]);
        $('#scorecard-budgeted').formatCurrency();
      }).fadeIn('fast');
      
      $('#scorecard-spent').fadeOut('fast', function(){
        $('#scorecard-spent').html(rows[0][1]);
        $('#scorecard-spent').formatCurrency();
        
        if (BudgetLib.loadYear == BudgetLib.endYear && rows[0][1] == 0) {
          $('#scorecard-spent').append("<sup class='ref'>&dagger;</sup>");
          $('#f-zero2011').show();
        } 
        else $('#f-zero2011').hide();
      }).fadeIn();
    }
  },
  
  
  //--------------------------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  // Load Main Page Functions
  //--------------------------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  
  //***************************************************************************
  // LoadMainPage
  // This function will setup the html page to display the main page.
  // It will populate the html page with data to display a cities
  // budgeted/spent data.
  //***************************************************************************
  loadMainPage: function(externalLoad)
  {
    //Hide Fund html
    //TODO
    $('#socorecard-fund-title').fadeOut();
    
    //Update page to display Main data
    BudgetLib.updateMainPage(externalLoad);
  },
  
  //***************************************************************************
  // Update Main Page
  // This function will perform all of the nessisary work to update and
  // display the main page.  Which shows a cities budget/spent numbers
  // over the years.
  //***************************************************************************
  updateMainPage: function(externalLoad)
  {
    if (externalLoad)
      BudgetQueries.getDateTotals("BudgetLib.updateTotals");// Updates Main Chart
    
    BudgetQueries.getAllFundsForYear(BudgetLib.loadYear, "BudgetLib.getDataAsBudgetTable"); //Update Funds
    
    $('#breakdown-item-title span').html('Fund');
    BudgetLib.updateHeader(BudgetLib.title, 'Fund');
    
    //Update Score Card
    BudgetQueries.getTotalsForYear(BudgetLib.loadYear, "BudgetLib.updateScorecard");
    BudgetQueries.getFundDescription(undefined, "BudgetLib.updateScorecardDescription");
  
    $('#breadcrumbs a').address();

    return
  },
    
  //***************************************************************************  
  //displays secondary datatables fund listing
  //***************************************************************************
  updateTable: function() {
    $('#breakdown').fadeOut('fast', function(){
      if (BudgetLib.breakdownTable != null) BudgetLib.breakdownTable.fnDestroy();
      
      $('#breakdown tbody').children().remove();
      $('#breakdown > tbody:last').append(BudgetLib.breakdownData);
      
      var maxArray = new Array();
      $('.budgeted.num').each(function(){
        maxArray.push(parseInt($(this).html()));
      });
      $('.spent.num').each(function(){
        maxArray.push(parseInt($(this).html()));
      });
      
      var maxBudgeted = Math.max.apply( Math, maxArray );
      if (maxBudgeted > 0) {
        $('.budgeted.num').each(function(){
          $(this).siblings().children().children('.budgeted.outer').width((($(this).html()/maxBudgeted) * 100) + '%');
        });
        $('.spent.num').each(function(){
          $(this).siblings().children().children('.spent.inner').width((($(this).html()/maxBudgeted) * 100) + '%');
        });
      }
      $('.budgeted.num').formatCurrency();
      $('.spent.num').formatCurrency();
      
      $('.adr').address(); //after adding the table rows, initialize the address plugin on all the links
      
      BudgetLib.breakdownTable = $("#breakdown").dataTable({
        "aaSorting": [[1, "desc"]],
        "aoColumns": [
          null,
          { "sType": "currency" },
          { "sType": "currency" },
          { "bSortable": false }
        ],
        "bFilter": false,
        "bInfo": false,
        "bPaginate": false
      });
    }).fadeIn('fast');
  },
  
 
  //----------display callback functions----------------
  
  //***************************************************************************
  //builds out budget breakdown (secondary) table
  //***************************************************************************
  getDataAsBudgetTable: function(json)
  {
    var rows = json["rows"];
    var fusiontabledata;
    
    for(i = 0; i < rows.length; i++)
    {
      var rowName            = rows[i][0];
      var year               = rows[i][1];
      var budgeted           = rows[i][2];
      var spent              = rows[i][3];      
      var rowId              = BudgetHelpers.convertToSlug(rowName);
      var detailLoadFunction = "BudgetLib.loadAndShowFundDetails(\"" + BudgetHelpers.convertToSlug(rowName) + "\");";
      
      if (budgeted != 0 || spent != 0)
      {
        fusiontabledata += BudgetHelpers.generateTableRow(rowId, detailLoadFunction, rowName, budgeted, spent);
      }
    }
 
    BudgetLib.breakdownData = fusiontabledata;
    BudgetLib.updateTable();
  },
  
  
  
  
  
  
  //--------------------------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  // Load FUND Page Functions
  //--------------------------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------

  //***************************************************************************
  // LoadFundPage
  // This function will setup the page to display a funds financial data.
  //***************************************************************************  
  loadFundPage: function(fund, externalLoad)
  {
    //HIDE Main page HTML
    //TODO
    
    //Update Fund Data
    BudgetLib.updateFundPage(fund, externalLoad);
    return
  },
  
  //***************************************************************************
  //function called to update the fund page
  //***************************************************************************  
  updateFundPage: function(fundName, date)
  {
    console.log("Hey DUD! update fund page was called with: " + fundName + " I'm Coming soon");
    
    //Queries the fusion tables to retrieve the info for the 2 breakdown tables
    BudgetQueries.getFundCatagories(fundName, date, "revenue", "BudgetLib.updateFundCatagories");
    BudgetQueries.getFundCatagories(fundName, date, "expense", "BudgetLib.updateFundCatagories");
    
    //Update Score Card
    BudgetQueries.getTotalsForYearFund(BudgetLib.loadYear, fundName,"BudgetLib.updateScorecard");
    BudgetQueries.getFundDescription(fundName, "BudgetLib.updateScorecardDescription");
    $('#socorecard-fund-title').html(fundName).fadeIn();
  
    $('#breadcrumbs a').address();
  },
  
  //***************************************************************************
  //This function will hide the main page content and show the fund, break-
  //down content.  
  //***************************************************************************
  loadAndShowFundDetails: function(fundName)
  {
    //Transition to FUND Page...
    $.address.parameter('fund', fundName);
    return;
  },
  
  
  //----------display callback functions----------------
  
  //***************************************************************************
  //builds out budget breakdown tables
  //***************************************************************************
  updateFundCatagories: function(json)
  {
  
  },
}
