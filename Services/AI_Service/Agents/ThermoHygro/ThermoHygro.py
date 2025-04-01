import asyncio
import time
import os
import sys

from Agent import Agent 
from Enviroment import Enviroment
from KnowledgeBase import KnowledgeBase

async def runAgent():
    env = Enviroment()
    knowledge_base = KnowledgeBase()
    
    agent = Agent(enviroment=env, knowledgeBase=knowledge_base)

    result = await env.startDay() 
    if not result.success.status:
        print(f"Error initializing environment: {result.message}")
        return
    
    while True:
        print("Fetching new forecasts...")
        tempResult = await agent.forecast("Temperature", append=True, plot=False)
        if not tempResult.success.status:
            print(f"Error forecasting temperature: {tempResult.message}")
        
        humidResult = await agent.forecast("Humidity", append=True, plot=False)
        if not humidResult.success.status:
            print(f"Error forecasting humidity: {humidResult.message}")
        
        print("Making decision based on current data...")
        decisions = agent.makeDecision()
        
        print("Executing actions...")
        agent.act()

        print("Waiting for next cycle...")
        await asyncio.sleep(1800)  

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(runAgent()) 
        
    except KeyboardInterrupt:
        print("Agent stopped manually.")
    finally:
        loop.close()
