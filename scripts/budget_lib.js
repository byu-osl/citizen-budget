/*!
 ***************************************************************************
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
 * 
 * Storing all of our data in Google Fusion Tables. For this visualization, I split it up in to 
 * 3 tables
 ****************************************************************************/

var BudgetLib = BudgetLib || {};  
var BudgetLib = {

  //LOOK@COOK IDs used to reference Fusion Tables, where we store our data
  FusionTableApiKey: "AIzaSyBiDIkXJCdmnUQoyGQNcUXVLj0i35nAk90",
  BUDGET_TABLE_ID: "1mahxWjls1dw0RCIsQ-rAzyGmgT0Ed7vXxRKnieY", //main budget table with expenditures/appropriations per department per year
  FUND_DESCRIPTION_TABLE_ID: "1DVnzs1tOFrVxrf6_jRFeXUe7b6lDYd5jh309Up4",
  
  //Citizen Budget Keys: IDs used to reference and access Fusion Tables, where the data is stored.
  CB_FusionTableApiKey:         "AIzaSyBiDIkXJCdmnUQoyGQNcUXVLj0i35nAk90",
  CB_FUND_TABLE_ID:             "1qrXUrlwMlihxJiBDLcLQFE5w-4lvrR3YWcuj2EE",
  CB_FUND_BREAK_DOWN_TABLE_ID:  "1WAx1a_FduyZIme5LG2LwkLgoqKfXahlagTctJ_o",
  CB_FUND_DESCRIPTION_TABLE_ID: "1HKXIvUWkx7W1R9YG0qsLnkCBCnsSj3CeMVeLHF8",
  
  // ecl This is the title that will show up to the left of the budget/spent blocks and under the graph.
  title:        "Cedar Hills City Budget",
  loadYear:     undefined,
  dateYearOnly: 1,                         //True == Only Show Year in HighCharts 

  //-------------front end display functions-------------------
  
  //***************************************************************************
  //primary load for graph and table
  //***************************************************************************
  updateDisplay: function(viewMode, year, fund, externalLoad) 
  {
    if (BudgetLib.loadYear == undefined)
    {
      BudgetLib.setLoadYear();
      return;
    }
    
    //load in values and update internal variables
    var viewChanged    = false;
    
    if (year != null && year != "") BudgetLib.loadYear = year;
    
    //load default view
    if (viewChanged || externalLoad)
    {
      //GET Totals for each year:
      //BudgetQueries.getTotalArray('', '', true,  "BudgetLib.updateAppropTotal"); //Appropreations
      //BudgetQueries.getTotalArray('', '', false, "BudgetLib.updateExpendTotal"); //Expenditures
      BudgetQueries.getDateTotals("BudgetLib.updateTotals")// Updates Appropreations and Expenditures
    }
    BudgetQueries.getAllFundsForYear(BudgetLib.loadYear, "BudgetLib.getDataAsBudgetTable");
    
    $("#breakdown-nav").html("\
      <ul>\
        <li class='current'>Where's it going?</li>\
      </ul>\
    <div class='clear'></div>");
    
    $('#breakdown-item-title span').html('Fund');
    
    //Update Score Card
    BudgetLib.updateHeader(BudgetLib.title, 'Fund');
    BudgetQueries.getTotalsForYear('', '', BudgetLib.loadYear, "BudgetLib.updateScorecard");
    BudgetQueries.getFundDescription(BudgetLib.fundView, "BudgetLib.updateScorecardDescription");
  
    $('#breadcrumbs a').address();
  },  
  
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
    
    $('#secondary-title').html(BudgetLib.loadYear + ' ' + view);
    $('#breakdown-item-title span').html(subtype);
  },
  
  //***************************************************************************  
  //displays secondary datatables fund/department listing
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
  
  //***************************************************************************
  //show/hide expanded detail for a clicked row
  //***************************************************************************
  updateDetail: function(itemId, detail) {
    if (BudgetLib.sparkChart != null) {
      BudgetLib.sparkChart.destroy();
      BudgetLib.sparkChart = null;
    }
    
    if ($('#' + itemId + '-expanded').length == 0) {
      $('.budget-expand-img').attr('src', 'images/expand.png');
      $('#breakdown .expanded-content').remove();
      $('#breakdown tr').removeClass('expanded-head');
      $('#' + itemId + ' .budget-expand-img').attr('src', 'images/collapse.png');
      $(detail).insertAfter($('#' + itemId));
      $('#' + itemId).addClass('expanded-head');
    }
    else {
      $('.budget-expand-img').attr('src', 'images/expand.png');
      $('#breakdown .expanded-content').remove();
      $('#breakdown tr').removeClass('expanded-head');
    }
  },

  //----------display callback functions----------------
  
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
  
  updateSparkAppropTotal: function(json) {
    BudgetLib.sparkAppropTotalArray = BudgetHelpers.getDataAsArray(json);
    BudgetHighcharts.updateSparkline();
  },
  
  updateSparkExpendTotal: function(json) {
    BudgetLib.sparkExpendTotalArray = BudgetHelpers.getDataAsArray(json);
    BudgetHighcharts.updateSparkline();
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
    var mostRecentYear  = parseInt(json["rows"][len][0].split("/")[2]);
    var currentLoadYear = BudgetLib.loadYear;
    
    //Update loadYear
    BudgetLib.loadYear = mostRecentYear;
    
    if (currentLoadYear == undefined)
      BudgetLib.updateDisplay(undefined, undefined, undefined, true);
    
  },
  
  //***************************************************************************
  //shows the description of the current view below the main chart
  //***************************************************************************
  updateScorecardDescription: function(json) { 
    var rows = json["rows"];
    var cols = json["columns"];

    if(rows != undefined) {
      $("#f-officers").hide();
      
      if (rows.length > 0) {
        $('#scorecard-desc p').hide().html(rows[0][0]).fadeIn();
      }
      else $('#scorecard-desc p').html('');
    }
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
      $('#scorecard .budgeted').fadeOut('fast', function(){
        $('#scorecard .budgeted').html(rows[0][0]);
        $('#scorecard .budgeted').formatCurrency();
      }).fadeIn('fast');
      
      $('#scorecard .spent').fadeOut('fast', function(){
        $('#scorecard .spent').html(rows[0][1]);
        $('#scorecard .spent').formatCurrency();
        
        if (BudgetLib.loadYear == BudgetLib.endYear && rows[0][1] == 0) {
          $('#scorecard .spent').append("<sup class='ref'>&dagger;</sup>");
          $('#f-zero2011').show();
        } 
        else $('#f-zero2011').hide();
      }).fadeIn();
    }
  },
  
  //***************************************************************************
  //builds out budget breakdown (secondary) table
  //***************************************************************************
  getDataAsBudgetTable: function(json)
  {
    var rows = json["rows"];
    var cols = json["columns"];  
    var fusiontabledata;
    
    for(i = 0; i < rows.length; i++)
    {
      var rowName            = rows[i][0];
      var year               = cols[3];
      var budgeted           = rows[i][1];
      var spent              = rows[i][2];      
      var rowId              = BudgetHelpers.convertToSlug(rowName);
      var detailLoadFunction = "BudgetLib.getFundDetails(\"" + BudgetHelpers.convertToSlug(rowName) + "\");";
      
      if (budgeted != 0 || spent != 0)
      {
        fusiontabledata += BudgetHelpers.generateTableRow(rowId, detailLoadFunction, rowName, budgeted, spent);
      }
    }
 
    BudgetLib.breakdownData = fusiontabledata;
    BudgetLib.updateTable();
  },
  
  
  //***************************************************************************
  //shows fund details when row is clicked
  //***************************************************************************
  getFundDetails: function(itemId) {  
    var fusiontabledata = BudgetHelpers.generateExpandedRow(itemId, 'fund');
    BudgetLib.updateDetail(itemId, fusiontabledata);
    BudgetQueries.getFundDescription(BudgetHelpers.convertToPlainString(itemId), "BudgetLib.updateExpandedDescription");
    BudgetQueries.getTotalArray(BudgetHelpers.convertToPlainString(itemId), 'Fund', true, "BudgetLib.updateSparkAppropTotal");
    BudgetQueries.getTotalArray(BudgetHelpers.convertToPlainString(itemId), 'Fund', false, "BudgetLib.updateSparkExpendTotal");
    BudgetQueries.getSparklinePercentages(BudgetHelpers.convertToPlainString(itemId), 'Fund', BudgetLib.loadYear, "BudgetLib.updateSparklinePercentages");
  },
  
  //***************************************************************************
  //shows description in expanded row when row is clicked
  //***************************************************************************
  updateExpandedDescription: function(json) {
    var rows = json["rows"];
    var description = '';
    
    if (rows != undefined)
      description = rows[0][0];
    
    $('#expanded-description').hide().html(description).fadeIn();
  },
  
  //***************************************************************************
  //requests department details from Fusion Tables when row is clicked
  //***************************************************************************
  getDepartmentDetails: function(departmentId) {
    departmentId = departmentId.replace('department-', '')
    BudgetQueries.getDepartmentDescription(departmentId, "BudgetLib.updateDepartmentDetails");
  },
  
  //***************************************************************************
  //shows department details when row is clicked
  //***************************************************************************
  updateDepartmentDetails: function(json) {
    var rows = json["rows"];

    var departmentId   = rows[0][0];
    var department     = rows[0][1];
    var linkToWebsite  = rows[0][2];
    var description    = rows[0][3];
    var departmentFund = rows[0][5];
     
    var fusiontabledata = BudgetHelpers.generateExpandedDeptRow(departmentId, department, description, linkToWebsite, departmentFund);
    BudgetLib.updateDetail('department-' + departmentId, fusiontabledata);
    
    BudgetQueries.getTotalArray(departmentId, 'Department ID', true, "BudgetLib.updateSparkAppropTotal");
    BudgetQueries.getTotalArray(departmentId, 'Department ID', false, "BudgetLib.updateSparkExpendTotal");
    BudgetQueries.getSparklinePercentages(departmentId, 'Department ID', BudgetLib.loadYear, "BudgetLib.updateSparklinePercentages"); 
  },
  
  
  //***************************************************************************
  //updates percentages that display below the expanded row sparkling
  //***************************************************************************
  updateSparklinePercentages: function(json) {
    var rows = json["rows"];
    var cols = json["columns"]; 

    if (rows.length > 0)
    {
      var budgetedTop = rows[0][0];
      var spentTop = rows[0][1];
      var budgetedBottom = rows[0][2];
      var spentBottom = rows[0][3];
      
      if (budgetedTop > 0 && budgetedBottom > 0) {
        var budgetedPercent = (((budgetedTop / budgetedBottom) - 1) * 100).toFixed(1);
        if (budgetedPercent >= -0.05) budgetedPercent = '+' + budgetedPercent;
        $('#sparkline-budgeted').hide().html('<strong>' + budgetedPercent + '%</strong> budgeted from ' + (BudgetLib.loadYear - 1)).fadeIn();
      }
      else $('#sparkline-budgeted').fadeOut();
      
      if (spentTop > 0 && spentBottom > 0) {
        var spentPercent = (((spentTop / spentBottom) - 1) * 100).toFixed(1);
        if (spentPercent >= -0.05) spentPercent = '+' + spentPercent;
        $('#sparkline-spent').hide().html('<strong>' + spentPercent + '%</strong> spent from ' + (BudgetLib.loadYear - 1)).fadeIn();
      }
      else $('#sparkline-spent').fadeOut();
    }
  }
}
