import csv
import time
import sys

###############################################################################
# Citizen Budget
# Authors: Dallin Smith
#
# The purpose of this parser is to read data from a text file into
# write the data into the appropriate csv file to be collected.
###############################################################################
def main(filename):
  fileDate = filename[:-4]
  fundsFile = open(fileDate + "-fundsFile.csv", "w")
  breakdownFile = open(fileDate + "-breakdownFile.csv", "w")
  
  with open(filename, 'rb') as csvfile:
  
    reader = csv.reader(csvfile)
    needDate = True
    date = ""
    fundName = ""
    isExpense = False
    budgetedRevenue = ""
    
    for row in reader:
      if (len(row) > 1):
        if row[0].startswith ("TOTAL") and not (wrongTotals(row[0])):
          ytdActual = row[2].replace(",", "")
          budgeted = row[3].replace(",", "")
          currentCatagory = row[0][6:]
          if currentCatagory == "FUND REVENUE":
            isExpense = True
            budgetedRevenue = budgeted
            fundsFile.write(ytdActual + ", ")
          elif currentCatagory == "FUND EXPENDITURES":
            isExpense = False
            fundsFile.write(ytdActual + ", " + budgetedRevenue + ", "+ budgeted +", ")
          else:
            if isExpense:
              breakdownType = "expense, "
            else:
              breakdownType = "revenue, "
            breakdownFile.write(currentCatagory + ", " + fundName + ", " + date + ", " + breakdownType + ytdActual +", " + budgeted + ", \n")
        if row[0].startswith ("NET"):
          currentCatagory = row[0][4:] # Get Net Name
          netBudget = row[2]
          netBudget = buildNetBudget(netBudget)
          fundsFile.write(netBudget + ", \n")
        
      if (len(row) == 1):
        #collects and formats the date if necessary
        if needDate and isDate(row[0]):
          date = makeDate(row[0])
          needDate = False
        if row[0].endswith ("FUND"):
          if fundName == row[0]:
            pass
          else:
            fundName = row[0]
            fundsFile.write(fundName + ", " + date + ", ")

  fundsFile.close()
  breakdownFile.close()

###############################################################################
# Builds the date. Collects date and puts in appropriate form
###############################################################################
def makeDate(date):
  conv = time.strptime(date,"%B %d, %Y")
  return time.strftime("%m/%d/%Y",conv)
    
###############################################################################
# Removes parenthesis for negative numbers and adds a negative sign if needed
###############################################################################
def buildNetBudget(netBudget):
  netBudget = netBudget.replace(",", "")
  if netBudget[:1] == "(":
    netBudget = netBudget.replace("(", "-")
    netBudget = netBudget.replace(")", "")
  return netBudget
        
###############################################################################
# Looks at the line to see if the first word is a month of the year.
###############################################################################
def isDate(firstEntry):
  months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", 
            "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"]
  potentialMonth = firstEntry.split()
  return potentialMonth[0] in months

###############################################################################
# This skips the first tables that have the word total
###############################################################################
def wrongTotals(firstEntry):
  #TODO find a way to clean this up
  return firstEntry.endswith ("COMBINED CASH") or \
         firstEntry.endswith ("UNALLOCATED CASH") or \
         firstEntry.endswith ("ALLOCATIONS TO OTHER FUNDS") or \
         firstEntry.endswith ("ASSETS") or \
         firstEntry.endswith ("LIABILITIES") or \
         firstEntry.endswith ("FUND EQUITY") or \
         firstEntry.endswith ("LIABILITIES AND EQUITY")


###############################################################################
# Command Line
# Accepts the file name
###############################################################################  
if __name__ == '__main__':
  #if len(sys.argv) !<= 2:
  #  print "\nUSAGE: \tparser <file.txt>\n"
  #else:
  main(sys.argv[1])
