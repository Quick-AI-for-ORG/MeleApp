import os
import sys
from dotenv import load_dotenv
sys.path.append(os.path.join(os.path.dirname('../../Utils')))
sys.path.append(os.path.join(os.path.dirname('../../../Shared')))

from Utils.req_res import Client
from Shared.Result import Result
load_dotenv(dotenv_path="../../../../.env")

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
    APIARY_ID = os.getenv('MY_APIARY')
    HIVE_ID = os.getenv('MY_HIVE')

    def __init__(self):
        self.webClient = Client(f"{os.getenv('IP')}:{os.getenv('PORT')}/hardware")
        self.paths = {
            'localForecast': "localForecast",
            'getApiary': "getApiary",
            'getHive': "getHive",
            'getSensor': "getSensor",
            'getReadings': "getHiveReadings",
        }

    def inject(self):  
        try:
            print(f"[REQUEST] Fetching Apiary details for {self.APIARY_ID}")
            result = self.webClient.post(self.paths['getApiary'], body={"_id": self.APIARY_ID})
            if not result.success.get("status"): return result
            self.apiary = result.data.get('data') or None

            print(f"[REQUEST] Fetching Hive details for {self.HIVE_ID}")
            result = self.webClient.post(self.paths['getHive'], body={"_id": self.HIVE_ID})
            if not result.success.get("status"): return result
            self.hive = result.data.get('data') or None

            print(f"[REQUEST] Fetching Temperature sensor details")
            result = self.webClient.post(self.paths['getSensor'], body={"sensorType": "Temperature"})
            if not result.success.get("status"): return result
            temp = result.data.get('data') or None

            print(f"[REQUEST] Fetching Humidity sensor details")
            result = self.webClient.post(self.paths['getSensor'], body={"sensorType": "Humidity"})
            if not result.success.get("status"): return result
            humid = result.data.get('data') or None

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
            
            self.updateLocalForecast()

            return Result(1, self, "Enviroment Injection Complete")

        except Exception as e:
            return Result(-1, None, f"Error injecting enviroment: {str(e)}")

    def getSensorReadings(self, sensor):
        print(f"[REQUEST] Fetching sensor readings for {sensor.get('_id')}")
        result = self.webClient.post(self.paths['getReadings'], body={"_id": self.HIVE_ID, "sensor": sensor.get('_id')})
        if result.success.get("status"):
            self.readings.get(sensor.get('sensorType').lower()).extend(result.data.get('data').get('readings'))
        return result

    def getLocalForecast(self):
        if not hasattr(self, 'apiary') or not self.apiary: return {"Temperature": None, "Humidity": None}
        print(f"[REQUEST] Fetching local forecast")
        return {
            "Temperature": self.apiary.get("temperature"),
            "Humidity": self.apiary.get("humidity")
        }

    def updateLocalForecast(self):
        print(f"[REQUEST] Updating local forecast for Apiary {self.APIARY_ID}")
        result = self.webClient.post(self.paths['localForecast'], body={
            "_id": self.APIARY_ID
        })
        if result.success.get("status"): self.apiary = result.data.get('data')
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

    def startDay(self):
        print(f"[PROCESS] Starting day for {self.APIARY_ID}")
        result = self.inject()
        if not result.success.get("status"): return result
        return self.updateLocalForecast()

if __name__ == "__main__":
    env = Enviroment()
    result = env.startDay()
