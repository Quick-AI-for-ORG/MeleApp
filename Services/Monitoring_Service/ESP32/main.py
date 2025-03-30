# Configurations    
import config
import req_res

# Sensors
import dht22

# Main Imports
import gc
import time

wlan = req_res.connect(config.SSID, config.PASSWORD)
if not wlan:
    print("Failed to connect to WiFi")
    exit()
try:
    while True:  
        for i in range(7):  
            config.selectDHT(config.MUX, i)        
            temp, hum = dht22.readSensor(i, config.MUX['SIG'])

            data = {
                'sensorType': config.SENSORTYPES['temp'],
                'sensorValue': temp,
                'hiveRef': config.HIVE_ID
            }

            req_res.sendSensorData(config.IP, config.WEB_PORT, config.ROUTE, config.READINGS_PATH, data)
            time.sleep(1)
            data.clear()
            gc.collect()

            data = {
                'sensorType': config.SENSORTYPES['humid'],
                'sensorValue': hum,
                'hiveRef': config.HIVE_ID
            }
            req_res.sendSensorData(config.IP, config.WEB_PORT, config.ROUTE, config.READINGS_PATH, data)
            time.sleep(5)
            data.clear()
            gc.collect()

except KeyboardInterrupt:
    print("\n[INFO] Interrupted! Stopping gracefully...")
    wlan.disconnect()  
    time.sleep(2)