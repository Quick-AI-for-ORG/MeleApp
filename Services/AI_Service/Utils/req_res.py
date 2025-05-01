import os
import sys
import requests
sys.path.append(os.path.join(os.path.dirname('../../Shared')))
from Shared.Result import Result

class Client:
    def __init__(self, baseURL):
        self.baseURL = "http://" + baseURL 
        self.headers = {"Content-Type": "application/json"} 

    def get(self, endpoint):
        try:
            response = requests.get(f"{self.baseURL}/{endpoint}", headers=self.headers)
            return self._handleResponse(response)
        
        except requests.exceptions.RequestException as e:
            return Result(-1, None, f"Error getting from {endpoint}: {str(e)}")

    def post(self, endpoint, body=None):
        try:
            response = requests.post(f"{self.baseURL}/{endpoint}", headers=self.headers, json=body)
            return self._handleResponse(response)
        
        except requests.exceptions.RequestException as e:
            return Result(-1, None, f"Error posting to {endpoint}: {str(e)}")

    def delete(self, endpoint, query=None):
        try:
            response = requests.delete(f"{self.baseURL}/{endpoint}{f'?{query}' if query else ''}", headers=self.headers)
            return self._handleResponse(response)
        
        except requests.exceptions.RequestException as e:
            return Result(-1, None, f"Error deleting from {endpoint}: {str(e)}")

    def _handleResponse(self, response):
        if not response.ok: 
            return Result(-1, None, f"HTTP error {response.status_code}: {response.text}")
        try: 
            return Result(1, response.json(), "Response received successfully")
        except ValueError: 
            return Result(-1, response.text, "Invalid JSON response")
