import subprocess
import serial
import time
from datetime import datetime  # Import datetime for timestamps
import csv
def logSerialData(port, csv_file):
    print("Connecting to Arduino...")
    arduino = serial.Serial(port, 9600, timeout=1)
    time.sleep(2)
    with open(csv_file, mode = 'w') as file:
        writer = csv.writer(file)
        if file.tell() == 0:
            writer.writerow(['Vibration'])
        print("Logging data to csv. Press Ctrl+C to stop logging.")
        try:
            while True:
                line = arduino.readline()
                print(line)
                try:
                    parts = line.split()
                    writer.writerow([parts[1]])
                except (IndexError, ValueError) as e:
                    print(f"Error parsing data: {e}")
        except KeyboardInterrupt:
            print("Logging stopped.")
            arduino.close()
        finally:
            arduino.close()
            
            
logSerialData('COM4', 'data.csv')