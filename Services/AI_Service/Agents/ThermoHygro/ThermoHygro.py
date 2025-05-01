import time
import os
import sys

from Agent import Agent 
from Enviroment import Enviroment
from KnowledgeBase import KnowledgeBase

def runAgent():
    env = Enviroment()
    knowledge_base = KnowledgeBase()
    
    agent = Agent(enviroment=env, knowledgeBase=knowledge_base)

    result =  env.startDay() 
    if not result.success.get("status"):
        print(f"Error initializing environment: {result.message}")
        return
    
    while True:
        print("Loading sensor readings...")
        tempResult = agent.enviroment.getSensorReadings(agent.enviroment.sensors["temperature"])
        if not tempResult.success.get("status"):
            print(f"Error fetching temperature readings: {tempResult.message}")
            
        humidResult = agent.enviroment.getSensorReadings(agent.enviroment.sensors["humidity"])
        if not humidResult.success.get("status"):
            print(f"Error fetching humidity readings: {humidResult.message}")
        
        print("Fetching new forecasts...")
        tempResult =  agent.forecast("Temperature", append=True, plot=False)
        if not tempResult.success.get("status"):
            print(f"Error forecasting temperature: {tempResult.message}")
        
        humidResult =  agent.forecast("Humidity", append=True, plot=False)
        if not humidResult.success.get("status"):
            print(f"Error forecasting humidity: {humidResult.message}")
        
        print("Making decision based on current data...")
        decisions = agent.makeDecision()
        print(decisions.get("reason"))
        
        print("Executing actions...")
        agent.act()

        print("Waiting for next cycle...")
        time.sleep(1800)  

if __name__ == "__main__":
    try:runAgent() 
    except KeyboardInterrupt:
        print("Agent stopped manually.")
  