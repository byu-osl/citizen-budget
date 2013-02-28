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
	//gets fund or department totals per year for highcharts
	//**********************************************************************
	getTotalArray: function(name, queryType, isAppropriation, callback)
	{
		var typeStr = "Expenditures";
		if (isAppropriation == true) 
			typeStr = "Appropriations";
	
		var myQuery = "SELECT ";
		var year = BudgetLib.startYear;
		while (year <= BudgetLib.endYear)
		{
			myQuery += "SUM('" + typeStr + " " + year + "') AS '" + year + "', ";
			year++;
		}
		myQuery = myQuery.slice(0,myQuery.length-2);  
		myQuery += " FROM " + BudgetLib.BUDGET_TABLE_ID;
		if (name != '')
			myQuery += " WHERE '" + queryType + "' = '" + name + "'";
		
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
}
