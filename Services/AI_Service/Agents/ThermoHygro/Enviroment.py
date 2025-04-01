import os
import sys
from dotenv import load_dotenv
sys.path.append(os.path.join(os.path.dirname('../Utils')))
sys.path.append(os.path.join(os.path.dirname('../../../Shared')))

from Utils.req_res import Client
from Shared.Result import Result
load_dotenv(dotenv_path="../../../.env")


class Hardware():
    def __init__(self, device, subModule=None):
        self.name = device
        self.mode = ("Off", False)
        self.status = "OK" 
        if subModule: self.fan = subModule

    def toggle(self, command):
        if self.status != "OK":
            print(f"[ERROR] {self.name} cannot toggle, status: {self.status}")
            return
        
        self.mode = command
        if command[1] and hasattr(self, 'fan'): self.fan.toggle(command)

            
        

class Enviroment():
    APIARY_ID = os.getenv('APIARY_ID')
    HIVE_ID = os.getenv('HIVE_ID')

    def __init__(self):
        self.webClient = Client(f"{os.getenv('IP')}:{os.getenv('PORT')}/hardware")
        self.paths = {
            'localForecast': "localForecast",
            'getApiary': "getApiary",
            'getHive': "getHive",
            'getSensor': "getSensor",
            'getReadings': "getHiveReadings",
        }
     
    async def inject(self):  
        try:
            
            result = await self.webClient.post(self.paths['getApiary'], body={"_id": self.APIARY_ID})
            if not result.success.status: return result
            self.apiary = result.data or None
            
            result = await self.webClient.post(self.paths['getHive'], body={"_id": self.HIVE_ID})
            if not result.success.status: return result
            self.hive = result.data or None
            
            result = await self.webClient.post(self.paths['getSensor'], body={"sensorType": "Temperature"})
            if not result.success.status: return result
            temp = result.data or None
            
            result = await self.webClient.post(self.paths['getSensor'], body={"sensorType": "Humidity"})
            if not result.success.status: return result
            humid = result.data or None
            
            self.sensors = {
                'temperature': temp,
                'humidity': humid
            }
            
            self.vent = Hardware("Vent")
            self.cooler = Hardware("Cooler", Hardware("Fan"))
            
            self.readings = {
                'temperature': [],
                'humidity': [],
            }
            
            return Result(1, self, "Enviroment Injection Complete")
        
        
        except Exception as e:
            return Result(-1, None, f"Error injecting enviroment: {str(e)}")

        
    async def getSensorReadings(self, sensor):
        result = await self.webClient.post(self.paths['getReadings'], body={"_id": self.HIVE_ID, "sensor": sensor._id})
        if result.success.status: self.readings[sensor.sensorType.lower()].extend(result.data)
        return result
    
    def getLocalForecast(self):
        if not hasattr(self, 'apiary') or not self.apiary: return {"Temperature": None, "Humidity": None}
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
    
    
    def getTrend(self, sensorType, step=7):
        readings = [reading["sensorValue"] for reading in self.readings[sensorType]]
        
        if len(readings) < (step * 3): return "STABLE"
        
        avg1 = sum(readings[-step:]) / step
        avg2 = sum(readings[-(step*2):-step]) / step
        avg3 = sum(readings[-(step*3):-(step*2)]) / step
        
        if avg1 > avg2 > avg3: return "RISING"
        elif avg1 < avg2 < avg3: return "DROPPING"
        return "STABLE"

            
        
    def toggle(self, hardware, command):
        hardware.toggle(command)
        
        
    async def startDay(self):
        result = await self.inject()
        if not result.success.status: return result
        return await self.updateLocalForecast()
        
        
        