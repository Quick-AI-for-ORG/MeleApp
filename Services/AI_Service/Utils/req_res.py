import os
import sys
import requests
sys.path.append(os.path.join(os.path.dirname('../../Shared')))
from Shared.Result import Result

class Client:
    def __init__(self, baseURL):
        self.baseURL = baseURL 
        self.headers = {"Content-Type": "application/json"} 
        self.timeout = (5, 15)

    async def get(self, endpoint):
        try:
            response = await requests.get(f"{self.baseURL}/{endpoint}", headers=self.headers, timeout=self.timeout)
            return self._handleResponse(response)
        
        except requests.exceptions.RequestException as e:
            return Result(-1, None, f"Error getting from {endpoint}: {str(e)}")

    async def post(self, endpoint, body=None):
        try:
            response = await requests.post(f"{self.baseURL}/{endpoint}", headers=self.headers, json=body, timeout=self.timeout)
            return self._handleResponse(response)
        
        except requests.exceptions.RequestException as e:
            return Result(-1, None, f"Error posting to {endpoint}: {str(e)}")

    async def delete(self, endpoint, query=None):
        try:
            response = await requests.delete(f"{self.baseURL}/{endpoint}{f'?{query}' if query else ''}", headers=self.headers, timeout=self.timeout)
            return self._handleResponse(response)
        
        except requests.exceptions.RequestException as e:
            return Result(-1, None, f"Error deleting from {endpoint}: {str(e)}")

    def _handleResponse(self, response):
        if not response.ok: return Result(-1, None, f"HTTP error {response.status_code}: {response.text}")
        try: return response.json()
        except ValueError: return Result(-1, response.text, "Invalid JSON response")
