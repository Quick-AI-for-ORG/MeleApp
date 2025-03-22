import os
import sys
from mesa import Model, Agent
sys.path.append(os.path.join(os.path.dirname('../Utils')))
from Utils.dbHandler import DBHandler

class HiveEnvironment(Model):
    def __init__(self):
        self.db = DBHandler()
        self.agent = ThermoHygro(1, self)
        self.schedule.add(self.agent)
     
    def inject(self, apiary_id):  
        self.apiary = self.db.get(apiary_id, "apiaries", "_id").data 
        self.hives = self.db.getAllFiltered(apiary_id, "hives", 'apiaryRef').data
        self.sensors = {
            'temperature': self.db.get('Temperature', 'sensors', 'sensorType').data,
            'humidity': self.db.get('Humidity', 'sensors', 'sensorType').data
        }
        
        for hive in self.hives:
            hive["cooler"] = False
            hive["fan"] = False
            hive["vent"] = False

        
    def getSensorReadings(self, sensor, hive):
        readings = self.db.getAllFiltered(hive._id, 'readings', 'hiveRef', ('sensorRef', sensor._id), sort=-1, limit=7)
        return readings.data
    
    def getAPIReadings(self):
        return {
            "Temperature": self.apiary["temperature"],
            "Humidity": self.apiary["humidity"]
        }

        
    def step(self):
        self.schedule.step()
        
        
class ThermoHygro(Agent):
    def __init__(self, unique_id, model):
        super().__init__(unique_id, model)
        self.optimal = {
            "temperature": (32.00, 36.00),
            "humidity": (50.00, 60.00)
        }
        
    def whereInRange(self, sensor, value):
        if value < self.optimal[sensor][0]: return -1 
        elif value > self.optimal[sensor][1]: return 1   
        return 0   
    
       
    def step(self):
        pass
  