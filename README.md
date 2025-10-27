# OxyRoute React - Air Quality Route Optimizer

A React application that finds the healthiest routes between locations by analyzing air quality data along different paths.

## 🚀 Features

- **Smart Route Analysis**: Compares multiple routes and selects the one with the best air quality
- **Real-time Air Quality Data**: Integrates with OpenWeather and WAQI APIs for accurate pollution data
- **AI-Powered Insights**: Uses Google Gemini AI to provide health recommendations
- **Interactive Maps**: Google Maps integration with route visualization
- **Comprehensive Charts**: Multiple chart types showing pollutant levels and health risks
- **Export Functionality**: Export data as CSV or PDF reports

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd oxyroute-react
npm install
```

### 2. Configure API Keys

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` file with your actual API keys:

```env
# Google Maps API Key (required)
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# OpenWeather API Key (required)
REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key_here

# Gemini AI API Key (optional - for AI insights)
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here

# WAQI Token (optional - for additional air quality data)
REACT_APP_WAQI_TOKEN=your_waqi_token_here
```

### 3. Get API Keys

#### Google Maps API Key (Required)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Maps JavaScript API" and "Places API"
4. Create credentials (API Key)
5. Restrict the key to your domain for security

#### OpenWeather API Key (Required)
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key from the dashboard
3. The free tier includes air pollution data

#### Gemini AI API Key (Optional)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. This enables AI-powered health insights

#### WAQI Token (Optional)
1. Visit [WAQI Data Platform](https://aqicn.org/data-platform/token/)
2. Request a free token
3. This provides additional air quality data sources

### 4. Run the Application

```bash
npm start
```

The app will open at `http://localhost:3000`

## 🔧 API Status Testing

The app includes a built-in API testing tool in the top-right corner that helps you verify:
- ✅ Google Maps API is loaded
- ✅ OpenWeather API is working
- ✅ Gemini AI API is accessible
- ✅ WAQI API is responding

## 🚨 Troubleshooting

### Common Issues

1. **Google Maps not loading**
   - Check if your API key is valid
   - Ensure Maps JavaScript API and Places API are enabled
   - Verify domain restrictions

2. **Air quality data not loading**
   - Verify OpenWeather API key is correct
   - Check if you've exceeded API rate limits
   - Ensure internet connection is stable

3. **AI insights not generating**
   - Check Gemini API key is valid
   - Verify you have API quota remaining
   - The app will fall back to local insights if AI fails

4. **CORS errors**
   - Some APIs may have CORS restrictions
   - The app includes fallback mechanisms for failed API calls

### Error Messages

- **"Google Maps is still loading"**: Wait a few seconds and try again
- **"Failed to find routes"**: Check that both locations are valid and accessible
- **"API quota exceeded"**: You've hit rate limits, try again later
- **"Request denied"**: Check API key configuration and restrictions

## 📊 How It Works

1. **Route Discovery**: Uses Google Maps to find multiple route alternatives
2. **Air Quality Sampling**: Samples air quality at 5 points along each route
3. **Health Score Calculation**: Weighs average AQI (50%) + pollution peaks (25%) + distance penalty (15%) + time penalty (10%)
4. **Route Selection**: Selects the route with the lowest health risk score
5. **AI Analysis**: Generates personalized health insights and recommendations

## 🌍 Supported Regions

- Primary: India (optimized AQI calculations)
- Global: Works worldwide with OpenWeather data
- Enhanced: Major cities with WAQI monitoring stations

## 📱 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🔒 Privacy & Security

- API keys are stored locally in environment variables
- No personal data is transmitted to third parties
- Location data is only used for route calculation
- All API calls are made directly from your browser

## 📄 License

MIT License - feel free to use and modify for your projects.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter issues:
1. Check the API Status Test tool
2. Verify your API keys are correct
3. Check browser console for error messages
4. Ensure all required APIs are enabled

---

**Note**: This app requires active internet connection and valid API keys to function properly. The demo will work with fallback data if APIs are unavailable.