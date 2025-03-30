import time
import network
import urequests

def connect(ssid, password):
    try:
        wlan = network.WLAN(network.STA_IF)
        wlan.active(True)
        if not wlan.isconnected():
            print('Connecting to network...')
            wlan.connect(ssid, password)
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
    
    
def sendToServer(ip, port, route, path, data):
    try:
        url = f"http://{ip}:{port}/{route}/{path}"
        print(f"\nSending to {url}")
        response = urequests.post(url, json=data)
        print("Server Response:", response.json().get('message'))
        data = response.json().get('data')
        response.close()
        if data: return data
        return False
    
    except Exception as e:
        print(f"Error sending data to server:", e)
        return False
    
def getFromServer(ip, port, path):
    try:
        url = f"http://{ip}:{port}/{path}"
        print(f"\nGetting from {url}")
        response = urequests.get(url)
        print("Server Response:", response.json().get('message'))
        data = response.json().get('data')
        response.close()
        if data: return data
        return False
    
    except Exception as e:
        print(f"Error getting data from server:", e)
        return False
    
    