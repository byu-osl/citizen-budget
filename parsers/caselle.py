from parser import Parser
from models.fund import *
from config import *

import csv

class Caselle(Parser):
    def __init__(self):
        self.pushed = None

    def date(self,filename):
        with open(filename, 'rb') as csvfile:
            self.reader = csv.reader(csvfile)
            while True:
                row = self.next_row()
                # skip blank lines
                if self.blank(row):
                    continue
                if self.begins(row,"CITY OF CEDAR HILLS"):
                    # read section
                    row = self.next_row()
                    row = self.next_row()
                    month, day, year = row[0].split()
                    return int(year)

    def parse(self,filename,date):
        year = Year.get_date(date)
        if not year:
            year = Year(date)
            db.session.add(year)
            db.session.commit()
        try:
            with open(filename, 'rb') as csvfile:
                self.reader = csv.reader(csvfile)
                while True:
                    section,fund_name = self.parse_header()
                    if section == "COMBINED CASH INVESTMENT":
                        self.parse_cash()
                        continue
                    if section == "BALANCE SHEET":
                        self.parse_balance_sheet(fund_name)
                        continue
                    if section == "REVENUES WITH COMPARISON TO BUDGET":
                        # get or create fund
                        fund = year.get_fund(name=fund_name)
                        if not fund:
                            fund = Fund(name=fund_name,year=year)
                            db.session.add(fund)
                            db.session.commit()
                        self.parse_revenues(fund)
                        continue
                    if section == "EXPENDITURES WITH COMPARISON TO BUDGET":
                        # get or create fund
                        fund = year.get_fund(name=fund_name)
                        if not fund:
                            fund = Fund(name=fund_name,year=year)
                            db.session.add(fund)
                            db.session.commit()
                        self.parse_expenditures(fund)
                        continue
                    if section:
                        raise Exception("Unexpected Section: %s" % section)
        except StopIteration:
            year = Year.get_date(date)
            for fund in year.funds:
                year.total_revenue += fund.total_revenue
                year.budgeted_revenue += fund.budgeted_revenue
                year.total_expenditures += fund.total_expenditures
                year.budgeted_expenditures += fund.budgeted_expenditures
            db.session.commit()
            pass
        except:
            raise

    def parse_header(self):
        section = None
        fund = None
        while True:
            row = self.next_row()
            # skip blank lines
            if self.blank(row):
                continue
            # check for end of administrative section
            if self.begins(row,"FOR ADMINISTRATION USE ONLY"):
                break
            if self.begins(row,"CITY OF CEDAR HILLS"):
                # read section
                row = self.next_row()
                try:
                    section = row[0]
                except:
                    raise Exception("Missing Section")
                # read date
                row = self.next_row()
                continue
            if self.begins(row,"PERIOD ACTUAL"):
                continue
            # read fund
            fund = row[0]

        return section, fund

    def parse_cash(self):
        while True:
            row = self.next_row()
            if self.blank(row):
                continue
            if self.begins(row,"TOTAL UNALLOCATED CASH"):
                pass
            if self.begins(row,"ZERO PROOF IF ALLOCATIONS BALANCE"):
                break

    def parse_balance_sheet(self,fund):
        while True:
            row = self.next_row()
            if self.blank(row):
                continue
            if self.begins(row,"TOTAL LIABILITIES AND EQUITY"):
                break

    def parse_revenues(self,fund):
        while True:
            row = self.next_row()
            if self.blank(row):
                continue
            if self.begins(row,"CITY OF CEDAR HILLS"):
                self.push_row(row)
                self.parse_header()
                continue
            if self.begins(row,"TOTAL FUND REVENUE"):
                fund.total_revenue = self.numeric(row[1])
                fund.budgeted_revenue = self.numeric(row[3])
                break
            name = row[0]
            # get or create category
            category = fund.get_category(name=name,revenue=True)
            if not category:
                category = Category(name=name,revenue=True,fund=fund)
                db.session.add(category)
            self.parse_category(category)
            db.session.commit()
        db.session.commit()

    def parse_expenditures(self,fund):
        while True:
            row = self.next_row()
            if self.blank(row):
                continue
            if self.begins(row,"CITY OF CEDAR HILLS"):
                self.push_row(row)
                self.parse_header()
                continue
            if self.begins(row,"TOTAL FUND EXPENDITURES"):
                fund.total_expenditures = self.numeric(row[1])
                fund.budgeted_expenditures = self.numeric(row[3])
                continue
            if self.begins(row,"NET REVENUE OVER EXPENDITURES"):
                break
            # get or create category
            name = row[0]
            category = fund.get_category(name=name,revenue=False)
            if not category:
                category = Category(name=name,revenue=False,fund=fund)
                db.session.add(category)
            self.parse_category(category)
            db.session.commit()
        db.session.commit()

    def parse_category(self,category):
        while True:
            row = self.next_row()
            if self.startswith(row,'TOTAL'):
                category.total = self.numeric(row[1])
                category.budget = self.numeric(row[3])
                break
            else:
                item = Item(category=category,code=row[0],name=row[1],
                            amount=self.numeric(row[2]),
                            budget=self.numeric(row[4]))
                db.session.add(item)
                
    def next_row(self):
        if self.pushed:
            row = self.pushed
            self.pushed = None
            return row
        return self.reader.next()

    def push_row(self,row):
        self.pushed = row

    def blank(self,row):
        if len(row) == 0:
            return True
        return False

    def begins(self,row,line):
        if row[0] == line:
            return True
        return False

    def startswith(self,row,start):
        if row[0].startswith(start):
            return True
        return False

    def numeric(self,value):
        return float(value.replace(',','').replace('(','-').replace(')',''))

if __name__ == '__main__':
    parser = Parser()
    parser.parse('caselle-example.txt',2012)
