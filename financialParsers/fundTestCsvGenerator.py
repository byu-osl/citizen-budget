import random

f = open('fundTestCsv.csv', 'wr')

fundNames = ('GENERAL FUND', 'CAPITAL PROJECT FUND',  'WATER AND SEWER FUND', 'MOTOR POOL FUND', 'GOLF COURSE FUND')
startYear = 1980
start_ytd_rev = 90
start_ytd_exp = 80
start_tb_rev = 100
start_tb_exp = 100

for i in range(0, 20):
   for fundName in fundNames:
      rev = start_ytd_rev + (i * 10000)
      exp = start_ytd_exp + (i * 10000) * random.randint(1, 100)
      f.write (fundName +
                  ", 1/9/" + str(startYear + i) + ", " +
                  str(rev) +  "," +
                  str(exp) + "," +
                  str(start_tb_rev + (i * 10000)) + "," +
                  str(start_tb_exp + (i * 10000) * random.randint(1, 100)) +  "," +
                  str(rev - exp) + ",\n"
                  )

f.close()