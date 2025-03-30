const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Result = require("../../Shared/Result");

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
  }

  async getWeatherData(lat, lon) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;

      const response = await axios.get(url);

      if (response.data.cod === 200) {
        const weather = response.data;
        return new Result(
          1,
          {
            location: weather.name || "Unknown Location",
            temperature: weather.main.temp,
            humidity: weather.main.humidity,
            windSpeed: weather.wind.speed,
            description: weather.weather[0].description,
            timestamp: new Date().toISOString(),
          },
          "Weather data retrieved successfully"
        );
      } else {
        return new Result(
          0,
          null,
          `Error fetching weather data: ${response.data.message}`
        );
      }
    } catch (error) {
      console.error("Weather API Error Details:");
      console.error("Status:", error.response?.status);
      console.error("Status Text:", error.response?.statusText);
      console.error("Response Data:", error.response?.data);
      return new Result(
        -1,
        null,
        `Error fetching weather data: ${error.message}`
      );
    }
  }
}

module.exports = new WeatherService();
