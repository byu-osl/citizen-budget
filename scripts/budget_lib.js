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
  title:        "Overview",
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
    //Used when explicitly transitioning from Main Page to a Fund Page
    if (BudgetLib.forceExternalLoad == true)
    {
      externalLoad = true;
      BudgetLib.forceExternalLoad = false;
    }
      
    //Initalize loadYear if Needed
    if (BudgetLib.loadYear == undefined)
    {
      BudgetLib.setLoadYear();
      return; //updateDisplay will be called again once the date has been set.
    }
    
    //Set Load Year 
    if (year != null && year != "")
      BudgetLib.loadYear = BudgetHelpers.convertToPlainString(year);
   
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
  updateHeader: function(view, subtype)
  {
    $('h1').html(view);
    
    $('#secondary-title').html((BudgetLib.dateYearOnly ?
                                BudgetLib.loadYear.split("/")[2] :
                                BudgetLib.loadYear)
                               + ' ' + BudgetLib.scTitle);
    $('#breakdown-item-title span').html(subtype);
  },
  

  // ---------------- Display Call Back Functions --------------------------
  
  //these all work by being called (callback function) once Fusion Tables returns a result. 
  //the function then takes the json and handles updating the page
  updateAppropTotal: function(json)
  {
    BudgetLib.appropTotalArray = BudgetHelpers.getDataAsArray(json);
    BudgetHighcharts.updateMainChart();
  },
  
  updateExpendTotal: function(json)
  {
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
      BudgetLib.updateDisplay($.address.parameter('year'),
                              $.address.parameter('fund'),
                              true);
    
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
    //Show Main Content
    $("#main-page").fadeIn();
    $("#content-secondary").fadeIn();
    
    //Hide Fund Content
    $("#breadcrumbs").fadeOut();
    $("#fund-page").fadeOut();
    $('#socorecard-fund-title').fadeOut();
    
    //Update page to display Main data
    BudgetLib.updateMainPage(externalLoad);
    
    //Update Dowload Data Link
    $('#download-button').attr('href', "");
    $('#download-button').attr('href', "https://www.google.com/fusiontables/DataSource?docid="+
                                        BudgetLib.CB_FUND_TABLE_ID);
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
    
    BudgetQueries.getAllFundsForYear(BudgetLib.loadYear,
                                     "BudgetLib.getDataAsBudgetTable"); //Update Funds
    
    $('#breakdown-item-title span').html('Fund');
    
    //Update Score Card
    BudgetLib.updateHeader(BudgetLib.title, 'Fund');
    BudgetQueries.getTotalsForYear(BudgetLib.loadYear, "BudgetLib.updateScorecard");
    BudgetQueries.getFundDescription(undefined, "BudgetLib.updateScorecardDescription");
  
    $('#breadcrumbs-link').attr('href', "");
    $('#breadcrumbs-link').attr('href', window.location.href);
  
    return
  },
    
  //***************************************************************************  
  //displays secondary datatables fund listing
  //***************************************************************************
  updateTable: function()
  {
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
      
      $('.budgeted.num').formatCurrency();
      $('.spent.num').formatCurrency();
      
      //after adding the table rows, initialize the address plugin on all the links
      $('.adr').address(); 
      
      BudgetLib.breakdownTable = $("#breakdown").dataTable({
        "aaSorting": [[1, "desc"]],
        "aoColumns": [
          null,
          { "sType": "currency" },
          { "sType": "currency" },
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
      var detailLoadFunction = "BudgetLib.loadAndShowFundDetails(\"" +
                                BudgetHelpers.convertToSlug(rowName) + "\");";
      
      if (budgeted != 0 || spent != 0)
        fusiontabledata += BudgetHelpers.generateTableRow(rowId,
                                                          detailLoadFunction,
                                                          rowName,
                                                          budgeted,
                                                          spent);
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
    //Show Fund Content
    $("#fund-page").fadeIn();
    $("#breadcrumbs").fadeIn();
    
    //Hides Main page HTML
    $("#main-page").fadeOut();
    $("#content-secondary").fadeOut();

    //Update Fund Data
    BudgetLib.updateFundPage(fund, externalLoad);
    
    //Update Dowload Data Link
    $('#download-button').attr('href', "");
    $('#download-button').attr('href', "https://www.google.com/fusiontables/DataSource?docid="+
                                        BudgetLib.CB_FUND_BREAK_DOWN_TABLE_ID);
  
    return
  },
  
  //***************************************************************************
  //function called to update the fund page
  //***************************************************************************  
  updateFundPage: function(fundName, externalLoad)
  {
    //Update the historical line graph for the fund
    if (externalLoad)
      BudgetQueries.getFundTotals(fundName, "BudgetLib.updateTotals");// Updates Main Chart
      

    BudgetQueries.getAFundsNote(fundName, BudgetLib.loadYear, "BudgetLib.updateAFundsNote");
      
    //Update Score Card
    BudgetLib.updateHeader(fundName, 'Fund');
    BudgetQueries.getTotalsForYearFund(BudgetLib.loadYear, fundName,"BudgetLib.updateScorecard");
    BudgetQueries.getFundDescription(fundName, "BudgetLib.updateScorecardDescription");
    $('#socorecard-fund-title').html(fundName).fadeIn();
    
    //Queries the fusion tables to retrieve the info for the 2 breakdown tables and pie charts
    BudgetQueries.getFundCatagories(fundName, BudgetLib.loadYear,
                                    "revenue", "BudgetLib.updateRevenueBlock");
    BudgetQueries.getFundCatagories(fundName, BudgetLib.loadYear,
                                    "expense", "BudgetLib.updateExpenditureBlock");
    
    //Queries and function calls for creating the net revenue table
    BudgetQueries.getNetTotals(BudgetLib.loadYear, fundName, "BudgetLib.updateDifferenceTable");
    
  },
  
  //***************************************************************************
  //This function will hide the main page content and show the fund, break-
  //down content.  
  //***************************************************************************
  loadAndShowFundDetails: function(fundName)
  {
    //Transition to FUND Page...
    BudgetLib.forceExternalLoad = true;
    $.address.parameter('fund', fundName);
    return;
  },
  
  
  //----------display callback functions----------------
  //---------------w/ a few helpers---------------------
  
  //***************************************************************************
  //builds out budget breakdown tables
  //***************************************************************************
  getBreakdownRows: function(json)
  {
    var rows = json["rows"];
    var fusiontabledata;
    
    for(i = 0; i < rows.length; i++)
    {
      var rowName            = rows[i][0];
      var ytdActual          = rows[i][1];
      var budgeted           = rows[i][2];
      var note               = rows[i][6];
      var fusiontableRowid   = rows[i][7];
      var rowId              = BudgetHelpers.convertToSlug(rowName);
      
      if (budgeted != 0 || ytdActual != 0)
        fusiontabledata += BudgetHelpers.generateBreakdownTableRow(rowId,
                                                                   rowName,
                                                                   budgeted,
                                                                   ytdActual,
                                                                   note,
                                                                   fusiontableRowid);
    }
 
    return fusiontabledata;
  },
  
  //***************************************************************************
  //This function will set a fund's note on the index.html page.
  //**************************************************************************  
  updateAFundsNote: function(json)
  {
    if (json["rows"][0][0] != undefined && json["rows"][0][0] != "")
    {
      $("#fund-notes").html(json["rows"][0][0]);
      $("#fund-notes-div").fadeIn();
    } 
    else
      $("#fund-notes-div").fadeOut();
      
    return;
  },
  
  //***************************************************************************
  //calls the functions that build out and update the breakdown table and pie 
  //chart for the fund's revenues.
  //**************************************************************************  
  updateRevenueBlock: function(json)
  {
    //functions to update the revenue table
    tableData = BudgetLib.getBreakdownRows(json);
    BudgetLib.updateRevenueTable(tableData);
    BudgetLib.updateRevenueTotals(json);
   
    //Update the revenue pie chart
    BudgetLib.updateRevenueBar(json);
  },

  //***************************************************************************
  //This function will update the revenue pie chart.
  //**************************************************************************
  updateRevenueBar: function(json)
  {
    var catAndAct = BudgetHelpers.genArrayOfCatigoriesAndActuals(json);
    
    BudgetHighcharts.updateBarGraph("revenue-pie-chart",
                                    "Revenues",
                                    catAndAct[0],//Catigories
                                    catAndAct[1]//data
                                    );
    return;
  },
  
  //***************************************************************************  
  //updates the fund revenue table
  //***************************************************************************
  updateRevenueTable: function(tableData)
  {
    $('#revenue-breakdown-table').fadeOut('fast', function(){
      if (BudgetLib.breakdownTable != null) BudgetLib.breakdownTable.fnDestroy();
      
      $('#revenue-breakdown-table tbody').children().remove();
      $('#revenue-breakdown-table > tbody:last').append(tableData);
      
      var maxArray = new Array();
      $('revenue-breakdown-table.budgeted.num').each(function(){
        maxArray.push(parseInt($(this).html()));
      });
      $('revenue-breakdown-table.spent.num').each(function(){
        maxArray.push(parseInt($(this).html()));
      });
      
      $('.budgeted.num').formatCurrency();
      $('.spent.num').formatCurrency();
      
      BudgetLib.breakdownTable = $("#revenue-breakdown-table").dataTable({
        "aaSorting": [[1, "desc"]],
        "aoColumns": [
          null,
          { "sType": "currency" },
          { "sType": "currency" },
        ],
        "bFilter": false,
        "bInfo": false,
        "bPaginate": false
      });
    }).fadeIn('fast');
  },
  
  //***************************************************************************  
  // Calculates and Sets the Totals for the Revenue table.
  //***************************************************************************
  updateRevenueTotals: function(json)
  {
    var rows = json["rows"];
    var ytdActualTotal = 0;
    var budgetedTotal  = 0;
    
    for(i=0; i < rows.length; i++)
    {
      ytdActualTotal += rows[i][1];
      budgetedTotal  += rows[i][2];
    }
    
    $('#revenue-ytdactual-total').html(ytdActualTotal);
    $('#revenue-budgeted-total' ).html(budgetedTotal);
    $('#revenue-ytdactual-total').formatCurrency();
    $('#revenue-budgeted-total' ).formatCurrency();
    $('#revenue-breakdown').fadeIn();
  },
     
  //***************************************************************************
  //calls the functions that build out and update the breakdown table and pie 
  //chart for the fund's expenditures.
  //**************************************************************************
  updateExpenditureBlock: function(json)
  {
    //functions to update the expenditures table
    tableData = BudgetLib.getBreakdownRows(json);
    BudgetLib.updateExpenditureTable(tableData);
    BudgetLib.updateExpenditureTotals(json);
    
    //Update the expenditures pie chart
    BudgetLib.updateExpenditurePie(json);
    
  },

  //***************************************************************************
  //This function will Update the expeniture pie chart.
  //**************************************************************************
  updateExpenditurePie: function(json)
  {
    var catAndAct = BudgetHelpers.genArrayOfCatigoriesAndActuals(json);
   
    BudgetHighcharts.updateBarGraph("expenditure-pie-chart",
                                    "Expenditures",
                                    catAndAct[0],
                                    catAndAct[1]);
    return;
  },
  
  //***************************************************************************  
  //updates the fund expenditure table
  //***************************************************************************
  updateExpenditureTable: function(tableData) {
    $('#expenditure-breakdown-table').fadeOut('fast', function(){
      if (BudgetLib.breakdownTable2 != null) BudgetLib.breakdownTable2.fnDestroy();
      
      $('#expenditure-breakdown-table tbody').children().remove();
      $('#expenditure-breakdown-table > tbody:last').append(tableData);
      
      var maxArray = new Array();
      $('.expenditure-breakdown-table.num').each(function(){
        maxArray.push(parseInt($(this).html()));
      });
      $('.expenditure-breakdown-table.num').each(function(){
        maxArray.push(parseInt($(this).html()));
      });
      
      $('.budgeted.num').formatCurrency();
      $('.spent.num').formatCurrency();
      
      BudgetLib.breakdownTable2 = $("#expenditure-breakdown-table").dataTable({
        "aaSorting": [[1, "desc"]],
        "aoColumns": [
          null,
          { "sType": "currency" },
          { "sType": "currency" },
        ],
        "bFilter": false,
        "bInfo": false,
        "bPaginate": false
      });
    }).fadeIn('fast');
  },
  
  //***************************************************************************  
  // Calculates and Sets the Totals for the Expenditure table.
  //***************************************************************************
  updateExpenditureTotals: function(json)
  {
    var rows = json["rows"];
    var ytdActualTotal = 0;
    var budgetedTotal  = 0;
    
    for(i=0; i < rows.length; i++)
    {
      ytdActualTotal += rows[i][1];
      budgetedTotal  += rows[i][2];
    }
    
    $('#expenditure-ytdactual-total').html(ytdActualTotal);
    $('#expenditure-budgeted-total' ).html(budgetedTotal);
    $('#expenditure-ytdactual-total').formatCurrency();
    $('#expenditure-budgeted-total' ).formatCurrency();
    $('#expenditure-breakdown').fadeIn();
  },
  
  //***************************************************************************  
  //updates the fund Net-Revenue-Minus-Expenditure table
  //***************************************************************************
  updateDifferenceTable: function(json)
  {
    var rows       = json["rows"];
    var net_rev    = rows[0][1];
    var net_expend = rows[0][2];
    var net_diff   = rows[0][3];
    
    $('#net-revenue-total'    ).html(net_rev);
    $('#net-expenditure-total').html(net_expend);
    $('#net-difference-total' ).html(net_diff);
    $('#net-revenue-total'    ).formatCurrency();
    $('#net-expenditure-total').formatCurrency();
    $('#net-difference-total' ).formatCurrency();
  },
 
 showBreakDownNote: function(fusiontableRowid)
 {
    BudgetQueries.getNotesPopoutInfo(fusiontableRowid, "BudgetLib.updateModalInformation");
    $('#basic-modal-content').modal();
 },
 
 updateModalInformation: function(json)
 {

    var rows       = json["rows"];
    var catagory   = rows[0][0];
    var ytdActual  = rows[0][1];
    var budgeted   = rows[0][2];
    var note       = rows[0][3];
    
    $('#modal-header'  ).html(catagory);
    $('#modal-spent'   ).html(ytdActual);
    $('#modal-budgeted').html(budgeted);
    $('#modal-spent'   ).formatCurrency();
    $('#modal-budgeted').formatCurrency();
    $('#modal-note'    ).html(note);
 },
}
