from machine import UART, Pin
import time

class UARTDiagnostic:
    def __init__(self, baudrate=115200):
        # Try multiple UART configurations
        self.uart_configs = [
            # (uart_id, tx_pin, rx_pin)
            (1, 17, 16),   # Common ESP32 configuration
            (1, 1, 3),     # ESP32-CAM typical
            (2, 22, 23),   # Alternative ESP32 pins
            (0, 1, 3)      # Another possible configuration
        ]
        
        self.baudrates = [
            115200,  # Most common
            9600,    # Fallback
            57600,   # Alternative
            38400    # Another alternative
        ]
        
    def test_uart_communication(self):
        print("Starting UART Communication Diagnostic")
        
        for baudrate in self.baudrates:
            print(f"\nTesting Baudrate: {baudrate}")
            
            for uart_config in self.uart_configs:
                uart_id, tx_pin, rx_pin = uart_config
                
                try:
                    # Initialize UART
                    uart = UART(uart_id, 
                                baudrate=baudrate, 
                                tx=tx_pin, 
                                rx=rx_pin,
                                bits=8, 
                                parity=None, 
                                stop=1)
                    
                    print(f"Testing UART{uart_id} with TX:{tx_pin}, RX:{rx_pin}")
                    
                    # Send test message
                    test_message = f"Test on UART{uart_id} at {baudrate} baud"
                    uart.write(test_message + "\n")
                    
                    # Wait for potential response
                    time.sleep(1)
                    
                    # Check for incoming data
                    if uart.any():
                        response = uart.read()
                        print("Received:", response.decode().strip())
                        return  # Success! Stop testing
                    else:
                        print("No response received")
                    
                    # Close UART
                    uart.deinit()
                
                except Exception as e:
                    print(f"Error with UART{uart_id}: {e}")
        
        print("No successful UART communication found")

# Run the diagnostic
while True:
    diagnostic = UARTDiagnostic()
    diagnostic.test_uart_communication()