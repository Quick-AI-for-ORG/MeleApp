import os
import sys
from dotenv import load_dotenv
import matplotlib.pyplot as plt
from Enviroment import Enviroment
from KnowledgeBase import KnowledgeBase

sys.path.append(os.path.join(os.path.dirname('../Utils')))
sys.path.append(os.path.join(os.path.dirname('../../../Shared')))

from Utils.req_res import Client
from Shared.Result import Result

load_dotenv(dotenv_path="../../../.env")

class Agent:
    def __init__(self, enviroment=Enviroment(), knowledgeBase=KnowledgeBase()):
        self.name = "ThermoHygro"
        self.enviroment = enviroment
        self.knowledgeBase = knowledgeBase
        self.aiClient = Client(f"{os.getenv('IP')}:{os.getenv('FLASK_PORT')}")
        self.forecasts = {"temperature": [], "humidity": []}
        
        self.actions = {'vent': False, 'fan': False, 'cooler': False}

    def forecast(self, sensorType, evaluate=False, append=False, plot=False):
        try:
            result = self.aiClient.post("forecast", body={
                "sensorType": sensorType,
                "readings": self.enviroment.readings.get(sensorType.lower()),
                "freq": 'T',
                "append": append,
                "steps": 4,
                "checkPerformance": evaluate,
                "getImage": plot
            })
            
            if not result.success.get('status'):
                return result
            
            if plot:
                plt.imshow(result.data.get('data').get("image"))
            if evaluate:
                print(result.data.get('data').get("metrics"))
            
            for forecast in result.data.get('data').get("forecasts").values():
                self.forecasts[sensorType.lower()].append(forecast)
                self.knowledgeBase.logForecast(sensorType.lower(), forecast)
             
            self.knowledgeBase.getAverageState(sensorType.lower(), self.forecasts[sensorType.lower()],  of="forecasted")            
            return Result(1, result.data, f"Forecasted {sensorType} Successfully")
        
        except Exception as e:
            return Result(-1, None, str(e))
        
    def makeDecision(self):
        previous = {
            "vent": self.enviroment.vent.mode[1],
            "fan": self.enviroment.cooler.fan.mode[1],
            "cooler": self.enviroment.cooler.mode[1]
        }

        hiveTemp = self.knowledgeBase.getAverageState("temperature", self.enviroment.readings.get("temperature"), "sensorValue")
        hiveHumid = self.knowledgeBase.getAverageState("humidity", self.enviroment.readings.get("humidity"), "sensorValue")
        apiary = self.enviroment.getLocalForecast()
        
        tempTrend = self.knowledgeBase.getTrend(self.forecasts.get("temperature"))
        humidTrend = self.knowledgeBase.getTrend(self.forecasts.get("humidity"))
        
        tempState = hiveTemp[1]
        humidState = hiveHumid[1]
        
        self.actions = previous
        
        reason = "Temperature and Humidity are within optimal ranges."
        
        if tempState == -3: 
            self.actions["vent"] = apiary['temperature'] > hiveTemp[1]
            reason = f"Critically low temperature detected, vent {'opened' if apiary['temperature'] > hiveTemp[1] else 'closed'} based on apiary temperature."
        
        elif tempState == 3: 
            self.actions["cooler"] = True
            reason = "Critically high temperature detected, cooler turned ON."
  
        if humidState == -3: 
            self.actions["cooler"] = True
            reason = "Critically low humidity detected, cooler turned ON."
            
        elif humidState == 3: 
            self.actions["fan"] = True
            reason = "Critically high humidity detected, fan turned ON."
            
        if tempTrend == "RISING" and tempState < 0 and tempState >-3:
            self.actions = previous
            reason = "Temperature is naturally rising, no action taken."
            
        elif tempTrend == "DROPPING" and tempState > 0 and tempState < 3:
            self.actions = previous
            reason = "Temperature is naturally dropping, no action taken."
            
        if humidTrend == "DROPPING" and humidState < 0 and humidState > -3:
            self.actions = previous
            reason = "Humidity is naturally dropping, no action taken."
            
        elif humidTrend == "RISING" and humidState > 0 and humidState < 3:
            self.actions = previous
            reason = "Humidity is naturally rising, no action taken."
        
        if tempState in [-1, 1]: 
            self.actions["vent"] = apiary["temperature"] < hiveTemp[1] if tempState == 1 else apiary["temperature"] > hiveTemp[1]
            reason = "Adjusting vent based on temperature change relative to apiary."
            
        if humidState in [-1, 1]:
            self.actions["vent"] = apiary["humidity"] < hiveHumid[1] if humidState == 1 else apiary["humidity"] > hiveHumid[1]
            reason = "Adjusting vent based on humidity change relative to apiary."

        if tempState in [-2, 2] or humidState in [-2, 2]:
            if tempState == 2: 
                self.actions["vent"] = apiary['temperature'] < hiveTemp[1]
                self.actions["cooler"] = True
                reason = f"High temperature detected, cooler turned on{', vent opened to cool.' if apiary['temperature'] < hiveTemp[1] else '.'}"
            elif tempState == -2: 
                self.actions["vent"] = apiary["temperature"] > hiveTemp[1]
                reason = "Low temperature detected, vent opened to warm."
            if humidState == 2: 
                self.actions["vent"] = apiary["humidity"] < hiveHumid[1]
                reason = "High humidity detected, vent opened to reduce humidity."
            if humidState == -2:
                self.actions["cooler"] = True
                self.actions["vent"] = apiary['temperature'] > hiveTemp[1]
                reason = f"Low humidity detected, cooler turned on{', vent opened to adjust temperature.' if apiary['temperature'] > hiveTemp[1] else '.'}"

        return {
            "toggleVent": previous["vent"] != self.actions['vent'],
            "toggleFan": previous["fan"] != self.actions['fan'],
            "toggleCooler": previous["cooler"] != self.actions['cooler'],
            "reason": reason
        }

    def act(self):
        decisions = self.makeDecision()
        
        if decisions["toggleVent"]:
            action = 'Opening Vent' if self.actions['vent'] else 'Closing Vent'
            print(f"[ACTION] {action}")
            self.enviroment.toggle(self.enviroment.vent, ("On", True) if self.actions['vent'] else ("Off", False))
            self.knowledgeBase.logAction(action, f'{decisions["reason"]}')
        
        if decisions["toggleFan"]:
            action = 'Turning ON Fan' if self.actions['fan'] else 'Turning OFF Fan'
            print(f"[ACTION] {action}")
            self.enviroment.toggle(self.enviroment.cooler.fan, ("On", True) if self.actions['fan'] else ("Off", False))
            self.knowledgeBase.logAction(action, f'{decisions["reason"]}')
        
        if decisions["toggleCooler"]:
            action = 'Turning ON Cooler' if self.actions['cooler'] else 'Turning OFF Cooler'
            print(f"[ACTION] {action}")
            self.enviroment.toggle(self.enviroment.cooler, ("On", True) if self.actions['cooler'] else ("Off", False))
            self.knowledgeBase.logAction(action, f'{decisions["reason"]}')
