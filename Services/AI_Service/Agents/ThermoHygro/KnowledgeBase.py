import time
class KnowledgeBase:
    VALID_RANGES = {
        "temperature": (-10, 150),
        "humidity": (0, 100)
    }
    
    OPTIMAL_RANGES = {
        "temperature": (32, 36),
        "humidity": (50, 60)
    }
    
    STATES = {
        -3: ("critical-low", -3),
        -2: ("low", -2),
        -1: ("slight-low", -1),
        0: ("optimal", 0),
        1: ("slight-high", 1),
        2: ("high", 2),
        3: ("critical-high", 3)
    }
    
    SEVERITY = ["LOW: Negligible", "MODERATE: Concerning", "HIGH: Critical"]
    
    def __init__(self, limit=250):
        self.actions = []
        self.forecasts = []
        self.conditions = []
        self.threats = []
        
        self.currentState = {
            "inside": {
                "temperature": self.STATES[0],
                "humidity": self.STATES[0]
            },
            "outside": {
                "temperature": self.STATES[0],
                "humidity": self.STATES[0]
            },
            "forecasted": {
                "temperature": self.STATES[0],
                "humidity": self.STATES[0]
            }
        }
        
        self.currentAverage = {
            "temperature": 32,
            "humidity": 50
        }
        
        self.limit = limit


    def logAction(self, action, reason="Not Disclosed"):
        self.limiter(self.actions)
        self.actions.append({"action": action, "reason":reason, "timestamp": time.time()})

    def logForecast(self, sensor, forecast):
        self.limiter(self.forecasts)
        self.forecasts.append({"sensor": sensor, "forecast": forecast, "timestamp": time.time()})
       
    def logCondition(self, sensor, of):
        self.limiter(self.conditions)
        self.conditions.append({"condition": f"{sensor} level {of} is {self.currentState[of][sensor][0]}", "degree": self.currentState[of][sensor][1],"timestamp": time.time()})
         
    def logThreat(self, threat, severity):
        self.limiter(self.threats)
        self.threats.append({"threat": threat, "severity": self.SEVERITY[severity], "timestamp": time.time()})
        
    def whereInRange(self, sensor, value, of="inside"): 
        if value < self.VALID_RANGES[sensor][0] or value > self.VALID_RANGES[sensor][1]:
            self.logThreat(f"Unnatural value {value} for {of} {sensor}", 0)
            return ("Discrepancy", None)
               
        if value < self.OPTIMAL_RANGES[sensor][0]: 
            distance = abs(value - self.OPTIMAL_RANGES[sensor][0])
            
            if distance > 10:
                self.currentState[of][sensor] = self.STATES[-3]
                self.logThreat(f"Critical low {sensor} detected at {value} in {of}", 2)
            elif distance > 5:
                self.currentState[of][sensor] = self.STATES[-2]
                self.logThreat(f"Low {sensor} detected at {value} in {of}", 1)
            else:
                self.currentState[of][sensor] = self.STATES[-1]      
        
        elif value > self.OPTIMAL_RANGES[sensor][1]: 
            distance = abs(value - self.OPTIMAL_RANGES[sensor][1])
            
            if distance > 10:
                self.currentState[of][sensor] = self.STATES[3]
                self.logThreat(f"Critical high {sensor} detected at {value} in {of}", 2)
            elif distance > 5:
                self.currentState[of][sensor] = self.STATES[2]
                self.logThreat(f"High {sensor} detected at {value} in {of}", 1)
            else:
                self.currentState[of][sensor] = self.STATES[1]
        
        else:
            self.currentState[of][sensor] = self.STATES[0]
        
        self.logCondition(sensor, of)
        return self.currentState[of][sensor]
    
    
    def getAverageState(self, sensor, readings, attribute="sensorValue", of="inside"):
        if of == 'inside': total = sum(reading[attribute] for reading in readings)
        elif of == 'forecasted':  total = sum(reading for reading in readings)
        
        avg = total / len(readings) if readings else 0
        
        if abs(avg - self.currentAverage[sensor]) > 1: 
            self.currentAverage[sensor] = avg
            return self.whereInRange(sensor, avg, of)
        
        return self.currentState[of][sensor]
    
    
    def getTrend(self, readings, step=7):        
        if len(readings) < (step * 3): return "STABLE"
        
        avg1 = sum(readings[-step:]) / step
        avg2 = sum(readings[-(step*2):-step]) / step
        avg3 = sum(readings[-(step*3):-(step*2)]) / step
        
        if avg1 > avg2 > avg3: return "RISING"
        elif avg1 < avg2 < avg3: return "DROPPING"
        return "STABLE"
    
    
    def clearLogs(self):
        self.actions = []
        self.forecasts = []
        self.conditions = []
        self.threats = []
        
        
    def limiter(self, logger):
        if len(logger) > self.limit:
            logger.clear()
