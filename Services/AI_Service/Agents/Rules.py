import random
from dataclasses import dataclass
from typing import List

@dataclass
class HiveState:
    temp: float
    humidity: float
    vent_open: bool = False
    cooler_fan: bool = False
    cooler_evap: bool = False

class BeehiveController:
    def __init__(self):
        self.state = HiveState(32.5, 55.0)  # Initial state
        self.outside_temp = 30.0
        self.outside_humidity = 50.0
        
    def dummy_sensor_data(self):
        """Generate simulated sensor readings with consideration for current state"""
        # Simulate natural environmental changes
        self.outside_temp = random.uniform(28.0, 38.0)
        self.outside_humidity = random.uniform(40.0, 70.0)
        
        # Calculate baseline changes
        temp_change = random.uniform(-0.3, 0.5)  # Natural temperature drift
        humidity_change = random.uniform(-1.0, 1.0)  # Natural humidity drift
        
        # Apply effects of current controller state
        if self.state.vent_open:
            # Vent open causes hive temperature and humidity to move toward outside conditions
            temp_change += (self.outside_temp - self.state.temp) * 0.2
            humidity_change += (self.outside_humidity - self.state.humidity) * 0.15
        
        if self.state.cooler_fan:
            # Fan reduces temperature and humidity slightly
            temp_change -= 0.4
            humidity_change -= 0.2
            
            if self.state.cooler_evap:
                # Evaporative cooling reduces temperature more but increases humidity
                temp_change -= 0.8
                humidity_change += 1.5
        
        # Apply the changes
        self.state.temp = max(min(self.state.temp + temp_change, 40.0), 25.0)  # Clamp between 25-40°C
        self.state.humidity = max(min(self.state.humidity + humidity_change, 80.0), 30.0)  # Clamp between 30-80%
        
    def decide_actions(self):
        """Apply complete rule set to determine actions"""
        prev_state = HiveState(
            temp=self.state.temp,
            humidity=self.state.humidity,
            vent_open=self.state.vent_open,
            cooler_fan=self.state.cooler_fan,
            cooler_evap=self.state.cooler_evap
        )
        
        # Store previous readings to detect rapid changes for Rule 15 & 16
        if not hasattr(self, 'prev_readings'):
            self.prev_readings = {
                'temp': self.state.temp,
                'humidity': self.state.humidity,
                'outside_temp': self.outside_temp,
                'outside_humidity': self.outside_humidity,
                'timestamp': 0
            }
        
        # Sensor discrepancy detection for Rule 14
        sensor_discrepancy = False
        # This is a placeholder - in a real system you'd have multiple sensors to compare
        # For simulation, we'll just set it to False since we don't have multiple sensors
        
        # External weather shock detection for Rule 16
        weather_shock = False
        humidity_spike = abs(self.outside_humidity - self.prev_readings['outside_humidity']) > 15
        temp_spike = abs(self.outside_temp - self.prev_readings['outside_temp']) > 5
        weather_shock = humidity_spike or temp_spike
        
        # Transition state detection for Rule 15
        in_transition = (abs(self.state.temp - 32) < 0.5 or 
                        abs(self.state.temp - 34) < 0.5 or
                        abs(self.state.humidity - 50) < 2 or
                        abs(self.state.humidity - 60) < 2)
        
        # Rule 14: Sensor discrepancy
        if sensor_discrepancy:
            # Maintain current state if sensors are unreliable
            pass
        
        # Rule 15: Transition state
        elif in_transition:
            # Monitor but don't change actuators during transition periods
            pass
        
        # Rule 16: External weather shock
        elif weather_shock:
            if humidity_spike and self.outside_humidity > self.state.humidity + 10:
                self.state.vent_open = False  # Close vent to avoid humidity spike
            self.state.cooler_fan = True
            self.state.cooler_evap = False
        
        # Rule 1: Temp low + cooler on
        elif self.state.temp < 32 and (self.state.cooler_evap or self.state.cooler_fan):
            self.state.cooler_evap = False
            self.state.cooler_fan = False
            if self.outside_temp < self.state.temp:
                self.state.vent_open = False

        # Rule 2/3: Temp low
        elif self.state.temp < 32:
            if self.outside_temp > self.state.temp:
                self.state.vent_open = True  # Rule 2
            else:
                self.state.vent_open = False  # Rule 3
            self.state.cooler_evap = False
            self.state.cooler_fan = False

        # Rule 11: High temp and high humidity (priority rule)
        elif self.state.temp > 34 and self.state.humidity > 60:
            self.state.cooler_evap = False  # Avoid evaporative cooling which adds humidity
            self.state.cooler_fan = True    # Use fan for cooling
            self.state.vent_open = self.outside_temp < self.state.temp  # Open vent only if outside is cooler

        # Rule 13: High temp and low humidity
        elif self.state.temp > 34 and self.state.humidity < 50:
            self.state.vent_open = False
            self.state.cooler_fan = True
            self.state.cooler_evap = True  # Simultaneous cooling and humidification

        # Rule 4/5: Temp high (but humidity in normal range)
        elif self.state.temp > 34:
            if self.outside_temp < self.state.temp:
                self.state.vent_open = True
                self.state.cooler_fan = True
                self.state.cooler_evap = False
            else:
                self.state.vent_open = False
                self.state.cooler_fan = True
                self.state.cooler_evap = True

        # Rule 12: Normal temp but low humidity
        elif 32 <= self.state.temp <= 34 and self.state.humidity < 50:
            self.state.vent_open = False
            self.state.cooler_fan = True
            self.state.cooler_evap = True  # Boost humidity while maintaining optimal temperature

        # Rule 6/7: Humidity low (that's not covered by Rule 12 or 13)
        elif self.state.humidity < 50:
            if self.state.temp >= 32:
                self.state.cooler_evap = True
                self.state.cooler_fan = True
            else:  # temp < 32
                self.state.cooler_fan = True
                if self.outside_humidity > self.state.humidity:
                    self.state.vent_open = True

        # Rule 8/9: Humidity high (that's not covered by Rule 11)
        elif self.state.humidity > 60:
            self.state.cooler_evap = False
            if self.state.temp < 34:
                if self.outside_humidity < self.state.humidity:
                    self.state.vent_open = True
            else:  # temp >= 34, but humidity not > 60 (Rule 11 would have caught that)
                if self.outside_temp < self.state.temp:
                    self.state.vent_open = True
                self.state.cooler_fan = True

        # Rule 10: Optimal conditions
        elif (32 <= self.state.temp <= 34) and (50 <= self.state.humidity <= 60):
            # Default maintenance behavior - maintain current state
            pass

        # Update previous readings for next comparison
        self.prev_readings = {
            'temp': self.state.temp,
            'humidity': self.state.humidity,
            'outside_temp': self.outside_temp,
            'outside_humidity': self.outside_humidity,
            'timestamp': self.prev_readings['timestamp'] + 1
        }

        # Return changes
        return {
            "vent_changed": prev_state.vent_open != self.state.vent_open,
            "fan_changed": prev_state.cooler_fan != self.state.cooler_fan,
            "evap_changed": prev_state.cooler_evap != self.state.cooler_evap
        }

    def print_state(self):
        print(f"Hive: {self.state.temp:.1f}°C, {self.state.humidity:.1f}% | "
              f"Outside: {self.outside_temp:.1f}°C, {self.outside_humidity:.1f}% | "
              f"Vent: {'Open' if self.state.vent_open else 'Closed'} | "
              f"Cooler: {'Fan' if self.state.cooler_fan else 'Off'} "
              f"{'+ Evap' if self.state.cooler_evap else ''}")

def simulate_day():
    controller = BeehiveController()
    print("=== Beehive Climate Control Simulation ===")
    print("Initial state:")
    controller.print_state()
    
    for hour in range(1, 25):  # 24 hours, starting from 1
        # Update sensor readings with feedback from current state
        controller.dummy_sensor_data()
        
        # Make decisions based on new readings
        changes = controller.decide_actions()
        
        # Print current state
        print(f"\nHour {hour}:")
        controller.print_state()
        
        # Highlight any changes made
        if any(changes.values()):
            change_items = [k.replace("_changed", "") for k, v in changes.items() if v]
            if change_items:
                print(f"  → Changes: {', '.join(change_items)}")

# Run simulation
if __name__ == "__main__":
    simulate_day()