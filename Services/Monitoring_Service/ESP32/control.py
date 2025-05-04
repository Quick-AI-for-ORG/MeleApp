import network
import urequests
import machine
import time
import ubinascii
from machine import ADC, Pin

SSID = "Ashraf"
PASSWORD = "ashdan2024"
ESP32CAM_IP = "192.168.1.114"
ESP32CAM_PATH = "/capture"
HIVE_REF = '67e9da6a78f6f3ff0a43625d'

SERVER_URL = "http://192.168.1.200:3000/hardware/addCapture"  

button = machine.Pin(23, machine.Pin.IN, machine.Pin.PULL_UP)

water_sensor = ADC(Pin(32))
water_sensor.atten(ADC.ATTN_11DB)  
water_sensor.width(ADC.WIDTH_12BIT)  

WATER_THRESHOLD = 500  
indicator_led = Pin(2, Pin.OUT)  

last_water_state = None
water_level_low = False

mq9  = ADC(Pin(33))
mq9.atten(ADC.ATTN_11DB)

GAS_THRESHOLD = 2000

def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print("Connecting to Wi-Fi...")
        wlan.connect(SSID, PASSWORD)
        
        max_wait = 20
        while max_wait > 0:
            if wlan.isconnected():
                break
            max_wait -= 1
            print("Waiting for connection...")
            time.sleep(1)
        
    if wlan.isconnected():
        print("Connected:", wlan.ifconfig())
        return True
    else:
        print("Connection failed!")
        return False

def capture_image():
    print("Starting image capture process...")
    try:
        print(f"Sending GET request to http://{ESP32CAM_IP}{ESP32CAM_PATH}")
        
        response = urequests.get(f"http://{ESP32CAM_IP}{ESP32CAM_PATH}", timeout=10)
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {response.headers}")
        
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', 'unknown')
            content_length = response.headers.get('Content-Length', 'unknown')
            print(f"Content-Type: {content_type}")
            print(f"Content-Length: {content_length}")
            
            print("Reading response content...")
            chunks = []
            total_size = 0
            chunk_size = 16
            
            while True:
                try:
                    chunk = response.raw.read(chunk_size)
                    if not chunk:
                        print("End of content reached")
                        break
                    
                    chunks.append(chunk)
                    total_size += len(chunk)
                    print(f"Read chunk: {len(chunk)} bytes, total: {total_size} bytes")
                    
                except Exception as e:
                    print(f"Error reading chunk: {e}")
                    break
            
            # Combine all chunks
            print(f"Total data read: {total_size} bytes")
            if total_size > 0:
                # Combine all chunks into a single bytes object
                image_data = b''.join(chunks)
                print(f"Image data assembled: {len(image_data)} bytes")
                
                # Close the response
                response.close()
                return image_data
            else:
                print("No data received")
                response.close()
                return None
        else:
            print(f"Error response: {response.status_code}")
            response.close()
            return None
    
    except Exception as e:
        print(f"Exception during image capture: {e}")
        return None

def send_to_server(image_data):
    try:
        print(f"Encoding {len(image_data)} bytes to base64...")
        
        base64_data = ubinascii.b2a_base64(image_data).decode('utf-8')
        print(f"Base64 encoded length: {len(base64_data)} characters")
        
        data = {
            'hiveRef': HIVE_REF,
            'image': base64_data
        }
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        print(f"Sending to server at {SERVER_URL}")
        response = urequests.post(
            url=SERVER_URL,
            json=data,
            headers=headers
        )
        
        print(f"Server response status: {response.status_code}")
        if response.status_code == 200:
            print("Image successfully sent to server!")
            try:
                response_text = response.text
            except:
                print("Could not read response text")
        else:
            print(f"Server error status: {response.status_code}")
            try:
                print(f"Error details: {response.text}")
            except:
                print("Could not read error details")
        
        response.close()
        return response.status_code == 200
    
    except Exception as e:
        print(f"Error sending to server: {e}")
        return False

def capture_and_send():
    image_data = capture_image()
    
    if image_data and len(image_data) > 0:
        print(f"Successfully captured image: {len(image_data)} bytes")
        success = send_to_server(image_data)
        if success:
            print("Process completed successfully!")
        else:
            print("Failed to send image to server")
    else:
        print("Failed to capture image")

def check_water_level():
    global last_water_state, water_level_low
    
    indicator_led.value(not indicator_led.value())
    
    try:
        value = water_sensor.read()
        print(f"Water sensor reading: {value}, Threshold: {WATER_THRESHOLD}")
        
        if value < WATER_THRESHOLD:
            print("WARNING: Water level is LOW!")
            water_level_low = True
            
            if last_water_state is not None and last_water_state != water_level_low:
                print("Water level changed to LOW - capturing image")
        else:
            print("Water level is ADEQUATE")
            water_level_low = False
        
        last_water_state = water_level_low
        return value
        
    except Exception as e:
        print(f"Error reading water sensor: {e}")
        return None
    
def check_flammable_gas():
    analog_value = mq9.read()
    print("Analog Value: " , analog_value)
    if(analog_value > GAS_THRESHOLD):
        print("Warning dangerous levels of gas")

# Main loop
def main():
    if connect_wifi():
        print("System initialized - monitoring water level and waiting for button press")
        print(f"Water sensor is on GPIO 32 (ADC), threshold set to {WATER_THRESHOLD}")
        print("-" * 40)
    
    while True:
        
    
        if button.value() == 0:  
            time.sleep(0.2) 
            if button.value() == 0:  
                print("Button pressed, capturing image...")
                capture_and_send()
                print("Waiting for next button press...")
                time.sleep(1)  
            
        check_water_level()
        check_flammable_gas()
        
        time.sleep(1)  

try:
    main()
except Exception as e:
    print("Main loop error:", e)