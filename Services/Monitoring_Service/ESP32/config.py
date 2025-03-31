from machine import Pin

'''WIFI Configuration'''
SSID = 'Ashraf'
PASSWORD = 'ashdan2024'


'''Server Configuration'''
IP = "192.168.1.44"
WEB_PORT = 3000
# FLASK_PORT = 5000
ROUTE = "hardware"


'''DB Configuration'''
APIARY_ID = '67e7c0691c9f5ffd18cac0ec'
HIVE_ID = '67e9da6a78f6f3ff0a43625d'
SENSORTYPES = {
    'temp': 'Temperature',
    'humid': 'Humidity',
    # 'weight': 'Weight',
    # 'gas': 'Flammable Gas',
    # 'vibr' : 'Vibration'
}

'''Pins Configuration'''
# FAN_RELAY_PIN = 0
# COOLER_RELAY_PIN = 1

# VENT_MOTOR_PIN = 0
# DOOT_MOTOR_PIN = 1

MUX = {
    'S0': Pin(12, Pin.OUT),
    'S1': Pin(14, Pin.OUT),
    'S2': Pin(27, Pin.OUT),
    'S3': Pin(26, Pin.OUT),
    'SIG': Pin(13)
}

'''Shared Variables'''
OPTIMAL = {
            "temp": (32.00, 36.00),
            "humid": (50.00, 60.00)
        }
READING_TIME = 30
READINGS_PATH = "addSensorReading"

'''Configuration Functions'''
def selectDHT(mux, num):
    for i in range(4):
        pin = mux['S' + str(i)]
        if i == 0: pin.value(num & 1)
        else: pin.value((num >> i) & 1)
        

# def whereInRange(optimal, value):
#     if value < optimal[0]: return -1 
#     elif value > optimal[1]: return 1   
#     return 0
        
        

