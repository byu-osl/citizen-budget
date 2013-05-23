import glob
import time

import financialsParser
import uploadCsvToFusion

for file_name in glob.glob('financials/*.txt'):
    financialsParser.main(file_name)

for file_name in glob.glob('financials/*fundsFile.csv'):
    uploadCsvToFusion.main(file_name, 0)
    time.sleep(1)

for file_name in glob.glob('financials/*breakdownFile.csv'):
    uploadCsvToFusion.main(file_name, 1)
    time.sleep(1)


