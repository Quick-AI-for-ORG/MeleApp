from machine import Pin
import dht

def readSensor(i, pin):
    try:
        DHT22 = dht.DHT22(pin)
        DHT22.measure()
        temp = DHT22.temperature()
        hum = DHT22.humidity()
        
        print(f"\nSensor ({i+1}) readings: ")
        print(f"Temperature: {temp}°C")
        print(f"Humidity: {hum}%")
        
        return temp, hum
    
    except OSError as e:
        print(f"Sensor ({i+1}) reading failed:", e)
