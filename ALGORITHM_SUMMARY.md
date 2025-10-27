# New Healthiest Route Algorithm

## Overview
The algorithm analyzes the top 3 routes from Google Maps and selects the one with the lowest mean AQI using OpenWeather API data and real AQI calculation from pollutant particles.

## Algorithm Steps

### 1. Route Discovery
- Get top 3 routes from Google Maps Directions API
- Routes are already sorted by Google's optimization (distance, time, traffic)

### 2. Pollutant Sampling (Per Route)
- Sample pollutant particles at exactly **3 points** along each route:
  - **Point 1**: 25% along the route
  - **Point 2**: 50% along the route (middle)
  - **Point 3**: 75% along the route
- Use **OpenWeather Air Pollution API** for raw pollutant data
- Get actual concentrations of: PM2.5, PM10, NO2, O3, CO, SO2

### 3. Real AQI Calculation
- Calculate real AQI from pollutant concentrations using **US EPA AQI formula**
- For each pollutant, use linear interpolation: `AQI = ((AQI_hi - AQI_lo) / (C_hi - C_lo)) * (C - C_lo) + AQI_lo`
- Take the **maximum AQI** from all pollutants as the final AQI for that point
- Identify the **dominant pollutant** (the one with highest AQI)

### 4. Mean AQI Calculation
- Calculate simple arithmetic mean of the 3 calculated AQI values per route
- Formula: `Mean AQI = (Point1_AQI + Point2_AQI + Point3_AQI) / 3`

### 5. Route Selection
- Select the route with the **LOWEST mean AQI**
- This is the healthiest route

### 6. User Display
- Show side-by-side comparison of all 3 routes
- Display each route's:
  - Mean AQI (primary metric)
  - AQI range (min-max from 3 points)
  - Distance and duration
  - Individual sampling point details
  - Raw pollutant concentrations
  - AQI calculation breakdown

## Key Features

### OpenWeather + Real AQI Calculation
- Primary: OpenWeather Air Pollution API for raw pollutant data
- Real-time calculation using US EPA AQI breakpoints
- More accurate than pre-calculated AQI values

### Visual Comparison
- Color-coded AQI values using standard AQI color scale
- Highlighted selected route with green accent
- Individual sampling point breakdown
- Algorithm explanation for transparency

### Data Format Handling
- Handles OpenWeather format: `{pm2_5: 45.2, pm10: 67.8, no2: 23.1, ...}`
- Real AQI calculation from raw concentrations
- Maintains pollutant concentration data for charts

## Console Logging
Detailed logging for debugging:
```
🗺️ Found 3 routes, analyzing top 3...

🔍 Analyzing Route 1:
  Distance: 12.5 km, Duration: 28 mins
  📍 Sampling 3 points: 25%, 50%, 75%
    📡 Point 1 (25%): 28.6139, 77.2090
      📊 Raw pollutants: PM2.5=45.2μg/m³, PM10=67.8μg/m³, NO2=23.1μg/m³
      🧮 Calculating real AQI from pollutant particles...
        PM2_5: 45.2 μg/m³ → AQI 125
        PM10: 67.8 μg/m³ → AQI 58
        NO2: 23.1 μg/m³ → AQI 22
      🏆 Final AQI: 125, Dominant: PM2_5
    📡 Point 2 (50%): 28.6200, 77.2150
      🏆 Final AQI: 142, Dominant: PM2_5
    📡 Point 3 (75%): 28.6250, 77.2200
      🏆 Final AQI: 168, Dominant: PM2_5
  📊 Route 1 Results:
    Mean AQI: 145 (from 3 points)
    Range: 125 - 168
    Dominant: PM2_5

🏆 HEALTHIEST ROUTE SELECTED: Route 2
   Mean AQI: 134 (lowest among all routes)
```

## Benefits
1. **Accurate**: Uses real pollutant concentrations from OpenWeather
2. **Scientific**: Calculates AQI using official US EPA formula
3. **Transparent**: Shows raw pollutant data and AQI calculation process
4. **Comprehensive**: Considers all major pollutants (PM2.5, PM10, NO2, O3, CO, SO2)
5. **User-friendly**: Visual comparison helps users understand the choice
6. **Reliable**: Robust fallback mechanisms for API failures