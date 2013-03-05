import csv
import time
import sys

###############################################################################
# Show Me The Money
# Authors: Dallin Smith
#
# The purpose of this parser is to read data from a text file into
# write the data into the appropriate csv file to be collected.
###############################################################################
def my_parse(filename):
    fund_description = open("fund_description.csv", "w")
    fund_break_down = open("fund_break_down.csv", "w")
    
    with open(filename, 'rb') as csvfile:
        reader = csv.reader(csvfile)
        Fund_Name = ""
        AnExpend = False
        firstLine = True
        gotDate = False
        revBudget = ""
        Date = ""
        for row in reader:
            if (row.__len__()>1):
                if not (wrong_totals(row[0])):
                    if row[0].startswith ("TOTAL"): 
                        ytd_actual = row[2]
                        ytd_actual = ytd_actual.replace(",", "")
                        budgeted = row[3]
                        budgeted = budgeted.replace(",", "")
                        curr_cat = row[0][6:]
                        if curr_cat == "FUND REVENUE":
                            AnExpend = True
                            revBudget = budgeted
                            fund_description.write(ytd_actual + ", ")
                        elif curr_cat == "FUND EXPENDITURES":
                            AnExpend = False
                            fund_description.write(ytd_actual + ", " + revBudget + ", "+ budgeted +", ")
                        else:
                            if AnExpend:
                                ExOrRev = "expense, "
                            else:
                                ExOrRev = "revenue, "
                            fund_break_down.write(curr_cat + ", " + Fund_Name + ", " + Date + ", " + ExOrRev + ytd_actual +", " + budgeted + ",")
                            fund_break_down.write("\n")
                        
                    if row[0].startswith ("NET"): 
                        curr_cat = row[0][4:] # Get Net Name
                        netBudget = row[2]
                        netBudget = build_net_budget(netBudget)
                        fund_description.write(netBudget + ",")
                
            if (row.__len__()==1):
                if  is_date(row[0]) and not gotDate:
                    Date = "Mon " + row[0]
                    Date = make_date(Date)
                    gotDate = True
                    
                if row[0].endswith ("FUND"):
                    if Fund_Name == row[0]:
                        pass
                    else:
                        Fund_Name = row[0]
                        if firstLine:
                            firstLine = False
                        else:
                            fund_description.write("\n")
                        fund_description.write(Fund_Name+", Date: " + Date+", ")
                                      
    fund_description.close()
    fund_break_down.close()

###############################################################################
# Builds the date. Collects date and puts in appropriate form
###############################################################################
def make_date(Date):
    Date = Date.replace(",", "")
    conv=time.strptime(Date,"%a %B %d %Y")
    return time.strftime("%d/%m/%Y",conv) #'15/02/2010'
    
###############################################################################
# Fixes Net Budget because there are () instead of -
###############################################################################
def build_net_budget(netBudget):
    netBudget = netBudget.replace(",", "")
    if netBudget[:1] == "(":
        netBudget = "-" + netBudget[1:]
        leng = len(netBudget) -1
        netBudget = netBudget[:leng]
    return netBudget
        
###############################################################################
# Finds the date by checking for every month in the text
###############################################################################
def is_date(col_one):
    return col_one.startswith ("JANUARY ") or col_one.startswith ("FEBRUARY ") or col_one.startswith ("MARCH ") or col_one.startswith ("APRIL ") or col_one.startswith ("MAY ") or col_one.startswith ("JUNE ") or col_one.startswith ("JULY ") or col_one.startswith ("AUGUST ") or col_one.startswith ("SEPTEMBER ") or col_one.startswith ("OCTOBER ") or col_one.startswith ("NOVEMBER ") or col_one.startswith ("DECEMBER ")


###############################################################################
# This skips the first tables that have the word total
###############################################################################
def wrong_totals(col_one):
    return col_one.endswith ("COMBINED CASH") or col_one.endswith ("UNALLOCATED CASH") or col_one.endswith ("ALLOCATIONS TO OTHER FUNDS") or col_one.endswith ("ASSETS") or col_one.endswith ("LIABILITIES") or col_one.endswith ("FUND EQUITY") or col_one.endswith ("LIABILITIES AND EQUITY")


###############################################################################
# Command Line
# Accepts the file name
###############################################################################  
if __name__ == '__main__':
    my_parse(sys.argv[1])



