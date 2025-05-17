import React from 'react';

export default function SunsetTime({ sunset }) {
  // Convert UNIX timestamp to local time string
  const sunsetDate = new Date(sunset * 1000);
  const time = sunsetDate.toLocaleTimeString();
  return (
    <div>
      <strong>Sunset:</strong> {time}
    </div>
  );
}