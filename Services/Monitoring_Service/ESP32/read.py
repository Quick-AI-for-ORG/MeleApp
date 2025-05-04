from machine import ADC, Pin
import urequests
import network
import time
import dht
import hx711

SSID = 'Ashraf'
PASSWORD = 'ashdan2024'
HIVE_REF = '67e9da6a78f6f3ff0a43625d'
SERVER_URL = "http://192.168.1.44:3000/hardware/addReading"


MUX = [Pin(0, Pin.OUT), Pin(0, Pin.OUT), Pin(0, Pin.OUT), Pin(0, Pin.OUT)]


def connect():
    try:
        wlan = network.WLAN(network.STA_IF)
        wlan.active(True)
        if not wlan.isconnected():
            print('Connecting to network...')
            wlan.connect(SSID, PASSWORD)
            max_wait = 10
            while max_wait > 0:
                if wlan.status() < 0 or wlan.status() >= 3:
                    break
                max_wait -= 1
                print('waiting for connection...')
                time.sleep(1)
                
        if wlan.isconnected():
            print('Network config:', wlan.ifconfig())
        else:
            print('Could not connect to WiFi')
            
        return wlan
    except Exception as e:
        print("Connection error:", e)
        return None

def send_to_server(sensor_type, sensor_value, frame=0):
    try:
        data = {
            'sensorType': sensor_type,
            'sensorValue': sensor_value,
            'hiveRef': HIVE_REF
        }
        if frame > 0:
            data['frameNum'] = frame
        
        print(f"\nSending to {SERVER_URL}")
        print("Data:", data)
        response = urequests.post(SERVER_URL, json=data)
        print("Server Response:", response.json().get('message'))
        response.close()
        return True
    except Exception as e:
        print(f"Error sending {sensor_type} to server:", e)
        return False
    
def select_channel(channel):
    for i in range(4):  
        MUX[i].value((channel >> i) & 0x01)

def main():
    print("Starting main loop...")
    while True:
        try:
            wlan = connect()
            if not wlan or not wlan.isconnected():
                print("No WiFi connection. Retrying in 5 seconds...")
                time.sleep(5)
                continue
            DHT22 = dht.DHT22(Pin(23)) 
            DHT22.measure()
            temp = DHT22.temperature()
            hum = DHT22.humidity()
            
            print("\nLocal readings:")
            print(f"Temperature: {temp}°C")
            print(f"Humidity: {hum}%")
            
            if send_to_server('Temperature', temp):
                print("Temperature data sent successfully")
            else:
                print("Failed to send temperature data")
            
            time.sleep(1)
            
            if send_to_server('Humidity', hum):
                print("Humidity data sent successfully")
            else:
                print("Failed to send humidity data")
                
            
            time.sleep(5)
            
            HX = hx711.HX711(dout=23, pd_sck=5) 
            for i in range(4):
                weight = HX.get_units()
                
                if send_to_server('Weight', weight, i+1):
                    print("Weight data sent successfully")
                else:
                    print("Failed to send weight data")
                    
                time.sleep(2)
                
                piezo = ADC(Pin(23))
                vibration = piezo.read()
                
                if send_to_server('Vibration', vibration, i+1):
                    print("Vibration data sent successfully")
                else:
                    print("Failed to send Vibration data")
            
        except OSError as e:
            print("Sensor reading failed:", e)
        except Exception as e:
            print("General error:", e)
        
        print("Waiting 5 seconds...")
        time.sleep(5)

if __name__ == '__main__':
    print("Program starting...")
    main()













