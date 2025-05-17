import logo from './logo.svg';
import './App.css';
// import {FaSearch} from 'react-icons/fa'
import { CiSearch } from "react-icons/ci";
import { FaSearch } from "react-icons/fa";
import { useState, useEffect } from 'react';
import ReactSpeedometer from "react-d3-speedometer"
import WindSpeed from './components/WindSpeed';
import SunsetTime from './components/SunsetTime';
import Temperature from './components/Temperature';


function App() {
  let [city, setCity] = useState('')
  let [wdetails, setWdetails] = useState()
  let [cityName, setCityName] = useState('City')
  let [cityTemp, setCityTemp] = useState('0')
  let [country, setCountry] = useState("")
  let [weatherman, setWeather] = useState('')
  let [source, setSource] = useState('')
  let [flagUrl, setFlagUrl] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [localTime, setLocalTime] = useState('');

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  let [hourlyTime, setHourlyTime] = useState();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Update local time every second if wdetails and timezone are available
    const localTimer = setInterval(() => {
      if (wdetails && wdetails.timezone !== undefined) {
        const utc = new Date().getTime() + (new Date().getTimezoneOffset() * 60000);
        const localDate = new Date(utc + (wdetails.timezone * 1000));
        setLocalTime(localDate.toLocaleTimeString());
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(localTimer);
    };
  }, [wdetails]);


  let getData = (event) => {
    event.preventDefault()
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=751d66e130befad396405dc13796a57c`)
      .then((res) => res.json())
      .then((finalRes) => {
        if (finalRes.cod == '404') {
          setWdetails(finalRes)
        } else {
          setWdetails(finalRes)
          setCityName(finalRes.name)
          setCityTemp(finalRes.main.temp)
          setCountry(finalRes.sys.country)
          setWeather(finalRes.weather[0].description)
          const iconCode = finalRes.weather[0].icon;
          setSource(`https://openweathermap.org/img/wn/${iconCode}@2x.png`);
          setFlagUrl(`https://flagcdn.com/64x48/${finalRes.sys.country.toLowerCase()}.png`);
          setLatitude(finalRes.coord.lat);
          setLongitude(finalRes.coord.lon);

          // Use lat/lon directly from API response for the next fetch
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${finalRes.coord.lat}&longitude=${finalRes.coord.lon}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`)
            .then((res2) => res2.json())
            .then((hourly1) => {
              setHourlyTime(hourly1)
            })
            .catch((err) => {
              console.error("Error fetching open-meteo data:", err);
            });
        }
        console.log(country, weatherman, cityTemp, cityName);
        console.log(finalRes);

      })
      .catch((err) => {
        console.error("Error fetching weather data:", err);
      });
  }

  // Determine background based on weather
  let weatherMain = wdetails && wdetails.weather && wdetails.weather[0].main ? wdetails.weather[0].main.toLowerCase() : '';
  let bgImage = '';
  if (weatherMain.includes('cloud')) {
    bgImage = 'clouds.jpg';
  } else if (weatherMain.includes('rain')) {
    bgImage = 'rain.jpg';
  } else if (weatherMain.includes('clear')) {
    bgImage = 'sun.jpg';
  } else {
    bgImage = 'default.jpg'; // fallback image
  }

  // Helper to get first 8 hours after current time from hourlyTime
  let hourlyForecast = [];
  if (hourlyTime && hourlyTime.hourly && hourlyTime.hourly.time && hourlyTime.hourly.temperature_2m) {
    // Find the index of the current hour or the next hour
    const now = new Date();
    const nowISO = now.toISOString().slice(0, 13); // "YYYY-MM-DDTHH"
    const idx = hourlyTime.hourly.time.findIndex(t => t.startsWith(nowISO));
    // Get the next 8 hours (if available)
    for (let i = idx + 1; i <= idx + 8 && i < hourlyTime.hourly.time.length; i++) {
      hourlyForecast.push({
        time: hourlyTime.hourly.time[i],
        temp: hourlyTime.hourly.temperature_2m[i]
      });
    }
  }

  // Calculate hour from localTime or fallback to currentTime
  let hour = 12;
  if (localTime) {
    // Try to parse hour from localTime string
    const parts = localTime.split(':');
    if (parts.length >= 2) {
      hour = parseInt(parts[0], 10);
      // Handle 12-hour format with AM/PM if needed
      if (localTime.toLowerCase().includes('pm') && hour < 12) hour += 12;
      if (localTime.toLowerCase().includes('am') && hour === 12) hour = 0;
    }
  } else {
    hour = currentTime.getHours();
  }

  // Set blue shade based on hour
  let bgColor = "#1e293b"; // default night
  if (hour >= 6 && hour < 10) {
    bgColor = "#3b82f6"; // morning blue
  } else if (hour >= 10 && hour < 16) {
    bgColor = "#60a5fa"; // day blue
  } else if (hour >= 16 && hour < 19) {
    bgColor = "#2563eb"; // evening blue
  } else if (hour >= 19 || hour < 6) {
    bgColor = "#1e293b"; // night blue
  }

  // Sync body background with bgColor
  useEffect(() => {
    document.body.style.background = `linear-gradient(${bgColor}, #111827)`;
  }, [bgColor]);

  return (
    <div>
      <h1 className='heading'>Simple Weather App</h1>
      <div className="time" style={{ color: "wheat", textAlign: "center", marginBottom: "10px" }}>
        Local Time: {localTime}
      </div>
      <div
        className='page'
        style={{
          height: "100vh",
          background: `linear-gradient(${bgColor}, #111827)`,
          backgroundImage: `url(/${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background 0.5s, background-image 0.5s"
        }}
      >
        <div className='containerpage'>
          <div className='iconContainer'>
            <img className="icon" src={source} alt={country}></img>
          </div>

          <form onSubmit={getData}>
            <input type='text' className='city' placeholder='Enter City' onChange={(event) => { setCity(event.target.value) }} value={city} />
            <button><FaSearch /></button>
          </form>
          <div className='bodyContainer'>

            <div className='weather-container'>
              <h2 className='cityboy'>
                {cityName} <span>{flagUrl && <img src={flagUrl} alt="flag" />}</span>
              </h2>
              {/* Use the new components */}
              {wdetails && wdetails.wind && <WindSpeed speed={wdetails.wind.speed} />}
              {wdetails && wdetails.sys && <SunsetTime sunset={wdetails.sys.sunset} />}
              {wdetails && wdetails.main && <Temperature kelvin={wdetails.main.temp} />}
              <h1>{weatherman}</h1>
            </div>
            {/* New container for next 8 hours forecast */}
          </div>
        </div>
        {hourlyForecast.length > 0 && (
          <div className="hourly-forecast" style={{ marginTop: "20px", background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "10px" }}>
            <h3 style={{ color: "wheat", marginBottom: "10px" }}>Next 8 Hours Forecast</h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
              {hourlyForecast.map((h, i) => (
                <div key={i} style={{ color: "white", minWidth: "80px", textAlign: "center" }}>
                  <div>{new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div>{h.temp}°C</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* <ReactSpeedometer /> */}
      </div>
    </div>
  );
}

export default App;
