import csv
import time


fFun = open("Funds.txt", "w")
fTot = open("Totals.txt", "w")

with open('report.txt', 'rb') as f:
    reader = csv.reader(f)
    Fund_Name = ""
    AnExpend = False
    firstLine = True
    funNames = []
    gotDate = False
    #onFund = 0
    Date2 = ""
    Date = "";
    for row in reader:
        if (row.__len__()>1):
            if not (row[0].endswith ("COMBINED CASH") or row[0].endswith ("UNALLOCATED CASH") or row[0].endswith ("ALLOCATIONS TO OTHER FUNDS") or row[0].endswith ("ASSETS") or row[0].endswith ("LIABILITIES") or row[0].endswith ("FUND EQUITY") or row[0].endswith ("LIABILITIES AND EQUITY")):
                if row[0].startswith ("TOTAL"): 
                    #print row[0]        
                    ytd_actual = row[2]
                    ytd_actual = ytd_actual.replace(",", "")
                    budgeted = row[3]
                    budgeted = budgeted.replace(",", "")
                    curr_cat = row[0][6:]
                    if curr_cat == "FUND REVENUE":
                        print " *** "+curr_cat
                        AnExpend = True
                        fFun.write(budgeted +", " + ytd_actual + ", " )
                        print "ytd_actual: " + ytd_actual + "   budgeted: " + budgeted
                    elif curr_cat == "FUND EXPENDITURES":
                        print " *** "+curr_cat
                        AnExpend = False
                        fFun.write(budgeted +", " + ytd_actual + ", " )
                        print "ytd_actual: " + ytd_actual + "   budgeted: " + budgeted
                    else:
                        print curr_cat
                        if AnExpend:
                            ExOrRev = "expense, "
                        else:
                            ExOrRev = "revenue, "
                        fTot.write(curr_cat + ", " + Fund_Name + ", " + Date2 + ", " + ExOrRev + ytd_actual +", " + budgeted + ",")
                        fTot.write("\n")
                        print "ytd_actual: " + ytd_actual + "   budgeted: " + budgeted
                if row[0].startswith ("NET"): 
                    curr_cat = row[0][4:] # Get Net Name
                    netBudget = row[2]
                    netBudget = netBudget.replace(",", "")
                    if netBudget[:1] == "(":
                        netBudget = "-" + netBudget[1:]
                        leng = len(netBudget) -1
                        netBudget = netBudget[:leng]
                    fFun.write(netBudget + ",")
                    print " ******** " + curr_cat + "  ytd_actual: " + netBudget
            
        if (row.__len__()==1):
            #print row
            #   collecting the Date
            if row[0].startswith ("JUNE ") and not gotDate:
                Date = "Mon " + row[0]
                Date = Date.replace(",", "")
                Date = Date.replace("E", "")
                conv=time.strptime(Date,"%a %b %d %Y")
                Date2 = time.strftime("%d/%m/%Y",conv) #'15/02/2010'
                gotDate = True
                
            if row[0].endswith ("FUND"):
                if Fund_Name == row[0]:
                    pass
                else:
                    #onFund += 1
                    Fund_Name = row[0]
                    print ""
                    print ""
                    print "      -----   "+Fund_Name+"   -----"
                    if firstLine:
                        firstLine = False
                    else:
                        fFun.write("\n")
                    fFun.write(Fund_Name+", " + Date2+", ")
                    
        
fFun.close()
fTot.close()
                    
                    
        
