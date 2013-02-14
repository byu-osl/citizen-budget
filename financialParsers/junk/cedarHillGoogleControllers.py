################################################################
# This function will add a funds finacial data to the google
# 'FUND" fushion table.  The idea is that there is one
# entry for every year.  This function will be
# adding a row to the google fusion table.
################################################################
def addFund(fund_name, date, ytd_total_revenues,
                             ytd_total_expenditures,
                             total_bedget,
                             total_bedgeted_expenditures,
                             net_revenue_over_expenditures):
    return 'junk'

################################################################
# This function will be adding one fund break down item
# to the google 'FundBreakDownItem' fusion table.
# For example the general fund is broken down in to
# assets, fees, Misc. Revenues, etc.  This function will
# be called for each of these items, bot revenues and expenses.
# This function will add a row to the fusion table.
################################################################
def addFundBreakDownItem(category_name, fund_name, date,
                                                   item_type,
                                                   ytd_actual,
                                                   budgeted):
    return 'junk'