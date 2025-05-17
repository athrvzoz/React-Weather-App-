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
  let [city,setCity]=useState('')
  let [wdetails,setWdetails]=useState()
  let [cityName,setCityName]=useState('City')
  let [cityTemp,setCityTemp]=useState('0')
  let [country,setCountry]=useState("")
  let [weatherman,setWeather]=useState('')
  let [source,setSource]=useState('')
  let [flagUrl, setFlagUrl] = useState(''); 
  const [currentTime, setCurrentTime] = useState(new Date());
  const [localTime, setLocalTime] = useState('');

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


  let getData=(event)=>{
    event.preventDefault()
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=751d66e130befad396405dc13796a57c`)
    .then((res)=>res.json())
    .then((finalRes)=>{
      if(finalRes.cod=='404'){
        setWdetails(finalRes)
      }else{
        setWdetails(finalRes)
        setCityName(finalRes.name)
        setCityTemp(finalRes.main.temp)
        setCountry(finalRes.sys.country)
        setWeather(finalRes.weather[0].description)
        const iconCode = finalRes.weather[0].icon;
        setSource(`https://openweathermap.org/img/wn/${iconCode}@2x.png`);
        // / Set flag URL using country code (lowercase for flagcdn)
        setFlagUrl(`https://flagcdn.com/64x48/${finalRes.sys.country.toLowerCase()}.png`);
        
        
      }
      console.log(country,weatherman,cityTemp,cityName);
      console.log(finalRes);
    })
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

  return (
    <div
      className='page'
      style={{
        height: "100vh",
        backgroundImage: `url(/${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background-image 0.5s"
      }}
    >
      <h1 className='heading'>Simple Weather App</h1>
      <div className="time" style={{ color: "wheat", textAlign: "center", marginBottom: "10px" }}>
        Local Time: {localTime}
      </div>
      <div className='containerpage'>
        <div className='iconContainer'>
        <img className="icon" src={source} alt={country}></img>
        </div>

        <form onSubmit={getData}>
          <input type='text' className='city' placeholder='Enter City' onChange={(event)=>{setCity(event.target.value)}} value={city}/> 
          <button><FaSearch/></button>
        </form>

        <div className='weather-container'>
            <h2>
              {cityName} <span>{flagUrl && <img src={flagUrl} alt="flag" />}</span>
            </h2>
            {/* Use the new components */}
            {wdetails && wdetails.wind && <WindSpeed speed={wdetails.wind.speed} />}
            {wdetails && wdetails.sys && <SunsetTime sunset={wdetails.sys.sunset} />}
            {wdetails && wdetails.main && <Temperature kelvin={wdetails.main.temp} />}
            <h1>{weatherman}</h1>
        </div>
      </div>
      <ReactSpeedometer/>
      
    </div>
  );
}

export default App;
