const axios = require("axios");

const stateMap = {
  IL: "Illinois",
  NY: "New York",
  CA: "California",
  TX: "Texas",
  FL: "Florida",
  WI: "Wisconsin",
  IN: "Indiana",
  MI: "Michigan",
  OH: "Ohio"
};

const getCoordinates = async (city, state) => {
  const response = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
    params: {
      name: city,
      count: 10,
      language: "en",
      format: "json"
    }
  });

  if (!response.data.results || response.data.results.length === 0) {
    throw new Error(`Location not found for weather lookup. Tried city: ${city}`);
  }

  const normalizedState = stateMap[state] || state;

  const matchedResult =
    response.data.results.find((result) =>
      result.country_code === "US" &&
      result.admin1 &&
      result.admin1.toLowerCase() === normalizedState.toLowerCase()
    ) ||
    response.data.results.find((result) => result.country_code === "US") ||
    response.data.results[0];

  return {
    latitude: matchedResult.latitude,
    longitude: matchedResult.longitude,
    name: matchedResult.name,
    country: matchedResult.country,
    country_code: matchedResult.country_code,
    state: matchedResult.admin1 || null
  };
};

const getWeatherForecast = async (latitude, longitude) => {
  const response = await axios.get("https://api.open-meteo.com/v1/forecast", {
    params: {
      latitude,
      longitude,
      current: "temperature_2m,precipitation,weather_code,wind_speed_10m",
      daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
      temperature_unit: "fahrenheit",
      wind_speed_unit: "mph",
      precipitation_unit: "inch",
      timezone: "auto"
    }
  });

  return response.data;
};

module.exports = {
  getCoordinates,
  getWeatherForecast
};