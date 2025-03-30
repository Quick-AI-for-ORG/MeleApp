import os
import sys
from dotenv import load_dotenv
sys.path.append(os.path.join(os.path.dirname('../Utils')))
from Utils.dbHandler import DBHandler
load_dotenv(dotenv_path="../../../.env")
APIARY_ID = os.getenv('APIARY_ID')
HIVE_ID = os.getenv('HIVE_ID')

class HiveEnvironment():
    def __init__(self):
        self.db = DBHandler()
        self.agent = ThermoHygro(1, self)
     
    def inject(self):  
        self.apiary = self.db.get(APIARY_ID, "apiaries", "_id").data 
        self.hive = self.db.get(HIVE_ID, "hives", '_id').data
        self.sensors = {
            'temperature': self.db.get('Temperature', 'sensors', 'sensorType').data,
            'humidity': self.db.get('Humidity', 'sensors', 'sensorType').data
        }
        self.hive["cooler"] = False
        self.hive["fan"] = False
        self.hive["vent"] = False

        
    def getSensorReadings(self, sensor, hive):
        readings = self.db.getAllFiltered(hive._id, 'readings', 'hiveRef', ('sensorRef', sensor._id), sort=-1, limit=7)
        return readings.data
    
    def getAPIReadings(self):
        return {
            "Temperature": self.apiary["temperature"],
            "Humidity": self.apiary["humidity"]
        }
        
    def toggle(self, hardware, command):
        self.hive[hardware] = command
        
    def getAverage(self, readings):
        total = sum(reading.value for reading in readings)
        return total / len(readings) if readings else 0
       
class ThermoHygro():
    def __init__(self):
        self.optimal = {
            "temperature": (32.00, 36.00),
            "humidity": (50.00, 60.00)
        }
        
        self.rules = {
          
        }
        
    def whereInRange(self, sensor, value):
        if value < self.optimal[sensor][0]: return -1 
        elif value > self.optimal[sensor][1]: return 1   
        return 0   
    
    
    