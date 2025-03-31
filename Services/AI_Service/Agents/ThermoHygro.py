import os
import sys
from dotenv import load_dotenv
sys.path.append(os.path.join(os.path.dirname('../Utils')))
from Utils.dbHandler import DBHandler
from Utils.req_res import Client
load_dotenv(dotenv_path="../../../.env")


class HiveEnvironment():
    APIARY_ID = os.getenv('APIARY_ID')
    HIVE_ID = os.getenv('HIVE_ID')

    def __init__(self):
        self.db = DBHandler()
        self.webClient = Client(f"{os.getenv("IP")}:{os.getenv("PORT")}")
     
    def inject(self):  
        self.apiary = self.db.get(self.APIARY_ID, "apiaries", "_id").data 
        self.hive = self.db.get(self.HIVE_ID, "hives", '_id').data
        self.sensors = {
            'temperature': self.db.get('Temperature', 'sensors', 'sensorType').data,
            'humidity': self.db.get('Humidity', 'sensors', 'sensorType').data
        }
        self.hive["cooler"] = False
        self.hive["fan"] = False
        self.hive["vent"] = False
        
        self.paths = {
            'localForecast': "hardware/localForecast",
        }

        
    def getSensorReadings(self, sensor, hive):
        readings = self.db.getAllNestedFilteredSorted([hive._id, sensor._id], 'readings', ['hiveRef', 'sensorRef'], limit=7)
        return readings.data if readings.success.status else []
    
    def getLocalForecast(self):
        return {
            "Temperature": self.apiary["temperature"],
            "Humidity": self.apiary["humidity"]
        }
        
    async def updateLocalForecast(self):
        result = await self.webClient.post(self.paths['localForecast'], body={
            "_id": self.APIARY_ID
        })
        if result.success.status: self.apiary = result.data
        return result
        
    def toggle(self, hardware, command):
        self.hive[hardware] = command
       
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
    
    
    def forecast(self, sensor):
        return
    
    
    