# Import JSON
import json

"""
Get config file

"""

print("***** Retrieving config file ********")

# Open and parse config file
with open ("./config/config.json", "r") as config:
    JSONDATA = json.load(config)

# Print config file 
print("Config data retrieved:")
for i in JSONDATA:
    # if (default_values) return
    print(i, JSONDATA[i])

#   Get list of categories from data
CATEGORIES = list(JSONDATA.keys())

print("Configuration categories: {0}".format(CATEGORIES))