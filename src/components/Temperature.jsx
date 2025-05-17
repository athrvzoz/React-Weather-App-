import React from 'react';

export default function Temperature({ kelvin }) {
  // Convert Kelvin to Celsius
  const celsius = (kelvin - 273.15).toFixed(1);
  return (
    <div>
      <strong>Temperature:</strong> {celsius}°C
    </div>
  );
}