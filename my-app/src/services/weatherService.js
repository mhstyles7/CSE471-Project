// Simple wrapper to fetch weather (you need an API key). This file just shows where integration belongs.
import axios from 'axios';
export async function fetchWeatherByLatLng(lat, lng) {
    // Example for OpenWeatherMap: replace REPLACE_ME
    // const key = process.env.REACT_APP_OPENWEATHER_KEY;
    // const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${key}&units=metric`);
    // return res.data;
    return { temp: 28, description: 'Partly cloudy' };
}