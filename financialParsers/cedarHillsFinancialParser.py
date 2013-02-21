import csv
import time


fFun = open("Funds.txt", "w")
fTot = open("Totals.txt", "w")

#fFun.write("Purchase Amount: " 'TotalAmount')
#fTot.write("Purchase Amount: " 'TotalAmount')

#class parser:
    
    #def __init__(self):
    #    startParse()
        
   # def startParse(self):
with open('cedarFinancial.csv', 'rb') as f:
    reader = csv.reader(f)
    Fund_Name = ""
    AnExpend = False
    funNames = []
    gotDate = False
    #onFund = 0
    Date = "";
    for row in reader:
        #for col in row:
            #print col
        
        #print row
        if (row.__len__()>1):
            if not (row[0].endswith ("COMBINED CASH") or row[0].endswith ("UNALLOCATED CASH") or row[0].endswith ("ALLOCATIONS TO OTHER FUNDS") or row[0].endswith ("ASSETS") or row[0].endswith ("LIABILITIES") or row[0].endswith ("FUND EQUITY") or row[0].endswith ("LIABILITIES AND EQUITY")):
                if row[0].startswith ("TOTAL"): 
                    #print row[0]        
                    Budget = row[2]
                    Budget = Budget.replace(",", "")
                    Unearned = row[3]
                    Unearned = Unearned.replace(",", "")
                    curr_cat = row[0][6:]
                    if curr_cat == "FUND REVENUE":
                        print " *** "+curr_cat
                        AnExpend = True
                        fFun.write(Unearned +", " + Budget + ", " )
                        print "Unearned: " + Unearned + "  Budget: " + Budget
                    elif curr_cat == "FUND EXPENDITURES":
                        print " *** "+curr_cat
                        AnExpend = False
                        fFun.write(Unearned +", " + Budget + ", " )
                        print "Unearned: " + Unearned + "  Budget: " + Budget
                    else:
                        print curr_cat
                        if AnExpend:
                            ExOrRev = "expense, "
                        else:
                            ExOrRev = "revenue, "
                        fTot.write(curr_cat + ", " + Fund_Name + ", " + Date2 + ", " + ExOrRev + Unearned +", " + Budget + ",")
                        fTot.write("\n")
                        print "Unearned: " + Unearned + "  Budget: " + Budget
                if row[0].startswith ("NET"): 
                    curr_cat = row[0][4:] # Get Net Name
                    netBudget = row[2]
                    netBudget = netBudget.replace(",", "")
                    if netBudget[:1] == "(":
                        netBudget = "-" + netBudget[1:]
                        leng = len(netBudget) -1
                        netBudget = netBudget[:leng]
                    fFun.write(netBudget + ",")
                    print " ******** " + curr_cat + "  Budget: " + netBudget
            
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
                    fFun.write("\n")
                    fFun.write(Fund_Name+", " + Date2+", ")
                    
        
fFun.close()
fTot.close()
                    
                    
        
