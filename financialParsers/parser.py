import csv
import time


def my_parse():
    fFun = open("Funds.txt", "w")
    fTot = open("Totals.txt", "w")
    
    with open('report.txt', 'rb') as f:
        reader = csv.reader(f)
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
                            fFun.write(ytd_actual + ", ")
                        elif curr_cat == "FUND EXPENDITURES":
                            AnExpend = False
                            fFun.write(ytd_actual + ", " + revBudget + ", "+ budgeted +", ")
                        else:
                            if AnExpend:
                                ExOrRev = "expense, "
                            else:
                                ExOrRev = "revenue, "
                            fTot.write(curr_cat + ", " + Fund_Name + ", " + Date + ", " + ExOrRev + ytd_actual +", " + budgeted + ",")
                            fTot.write("\n")
                        
                    if row[0].startswith ("NET"): 
                        curr_cat = row[0][4:] # Get Net Name
                        netBudget = row[2]
                        build_net_budget(netBudget)
                        fFun.write(netBudget + ",")
                
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
                            fFun.write("\n")
                        fFun.write(Fund_Name+", Date: " + Date+", ")
                                      
    fFun.close()
    fTot.close()

def make_date(Date):
    Date = Date.replace(",", "")
    conv=time.strptime(Date,"%a %B %d %Y")
    return time.strftime("%d/%m/%Y",conv) #'15/02/2010'
    
    
def build_net_budget(netBudget):
    netBudget = netBudget.replace(",", "")
    if netBudget[:1] == "(":
        netBudget = "-" + netBudget[1:]
        leng = len(netBudget) -1
        netBudget = netBudget[:leng]
        
def is_date(col_one):
    return col_one.startswith ("JANUARY ") or col_one.startswith ("FEBRUARY ") or col_one.startswith ("MARCH ") or col_one.startswith ("APRIL ") or col_one.startswith ("MAY ") or col_one.startswith ("JUNE ") or col_one.startswith ("JULY ") or col_one.startswith ("AUGUST ") or col_one.startswith ("SEPTEMBER ") or col_one.startswith ("OCTOBER ") or col_one.startswith ("NOVEMBER ") or col_one.startswith ("DECEMBER ")

def wrong_totals(col_one):
    return col_one.endswith ("COMBINED CASH") or col_one.endswith ("UNALLOCATED CASH") or col_one.endswith ("ALLOCATIONS TO OTHER FUNDS") or col_one.endswith ("ASSETS") or col_one.endswith ("LIABILITIES") or col_one.endswith ("FUND EQUITY") or col_one.endswith ("LIABILITIES AND EQUITY")

# call my function 
my_parse()



