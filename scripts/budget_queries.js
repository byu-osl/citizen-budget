/*!
 ***********************************************************************
 * Look at Cook Budget Queryies library
 * http://lookatcook.com/
 *
 * Copyright 2012, Derek Eder and Nick Rougeux
 * Licensed under the MIT license.
 * https://github.com/open-city/look-at-cook/wiki/License
 *
 * Date: 3/24/2012
 *
 * Fusion Table queries called by BudgetLib
 ***********************************************************************/

var BudgetQueries = BudgetQueries || {};  
var BudgetQueries = {

	//**********************************************************************
	// This funciton will get the most current date from the table and
	// return its year.
	//**********************************************************************
	getDates: function(callback)
	{
		var myQuery = "SELECT date FROM " +
			      BudgetLib.CB_FUND_TABLE_ID +
			      " GROUP BY date" +
			      " ORDER BY date ASC";
		
		BudgetHelpers.query(myQuery, callback);
	},
	
	//**********************************************************************	
	//This function will get the total budgeted and spent for each year
	//from the FUND fusion table.
	//This data is retrieved to populate the main line graph.
	//**********************************************************************
	getDateTotals: function(callback)
	{
		var myQuery = "SELECT date,"
		
		myQuery += "SUM (ytd_total_expenditures), SUM (total_budgeted_expenditures) ";

		myQuery += " FROM " + BudgetLib.CB_FUND_TABLE_ID;
		
		myQuery += " GROUP BY date ";
		
		myQuery += "ORDER BY date ASC"
		
		console.log(myQuery);
		
		BudgetHelpers.query(myQuery, callback);
	},
	
	//**********************************************************************
	//returns total given year
	//**********************************************************************
	getTotalsForYear: function(year, callback)
	{
		var myQuery = "SELECT SUM (total_budgeted_expenditures), SUM (ytd_total_expenditures), date";

		myQuery    += " FROM " + BudgetLib.CB_FUND_TABLE_ID;
		
		myQuery    += " WHERE date = '" + year + "'";
		
		myQuery    += " GROUP BY date ";
		
		
		console.log(myQuery);
		console.log("year:'" + year + "'");
		
		BudgetHelpers.query(myQuery, callback);
	},
	
	//**********************************************************************
	//returns all funds budgeted/spent totals for given year
	//**********************************************************************
	getAllFundsForYear: function(year, callback)
	{		
		var myQuery = "SELECT fund_name, date, total_budgeted_expenditures, ytd_total_expenditures ";
		
		myQuery += "FROM " + BudgetLib.CB_FUND_TABLE_ID;
		
		myQuery += " WHERE date='" + year + "'";
		console.log("year:'" +year +"'");
		BudgetHelpers.query(myQuery, callback);
	},
	
	//**********************************************************************
	//gets a fund description based on a fund name
	//**********************************************************************
	getFundDescription: function(fund, callback) {
		var myQuery = "SELECT 'Fund Description' FROM " + BudgetLib.FUND_DESCRIPTION_TABLE_ID + " WHERE Item = '" + fund + "'";			
		BudgetHelpers.query(myQuery, callback);
	},
	
	//**********************************************************************
	// 
	// Gets the different catagories for the breakdown table on the fund page
	// fund : fund data to be queried 
	// date : year or date of information
	// tableType : breakdown table information to be retrieved (revenue or expense)
	//
	//**********************************************************************
	getFundCatagories: function(fund, date, tableType, callback) {		
		var myQuery = "SELECT 'category_name', 'ytd_actual', 'budgeted', 'fund_name', 'year', 'type' ";
		myQuery += "FROM " + BudgetLib.CB_FUND_BREAK_DOWN_TABLE_ID;
		myQuery += " WHERE 'fund_name' = '" + fund + "' AND 'year' = '" + date + "' AND 'type' = '" + tableType + "'";			
		BudgetHelpers.query(myQuery, callback);
	},
}
