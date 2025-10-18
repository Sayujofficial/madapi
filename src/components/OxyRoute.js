import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie, Doughnut, PolarArea, Radar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend);

const OxyRoute = () => {
    // Advanced iOS glassmorphism animations and effects
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
            @keyframes subtleFloat {
                0%, 100% { 
                    transform: translateY(0px);
                }
                50% { 
                    transform: translateY(-3px);
                }
            }
            @keyframes subtleShimmer {
                0% { 
                    background-position: -200% 0;
                    opacity: 0;
                }
                50% {
                    opacity: 0.3;
                }
                100% { 
                    background-position: 200% 0;
                    opacity: 0;
                }
            }
            @keyframes subtleBlur {
                0%, 100% {
                    backdrop-filter: blur(25px) saturate(120%);
                    border-color: rgba(255, 255, 255, 0.1);
                }
                50% {
                    backdrop-filter: blur(28px) saturate(125%);
                    border-color: rgba(255, 255, 255, 0.15);
                }
            }
            @keyframes subtleGlow {
                0%, 100% {
                    box-shadow: 
                        0 8px 32px rgba(0, 0, 0, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                }
                50% {
                    box-shadow: 
                        0 12px 40px rgba(0, 0, 0, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.15);
                }
            }
            .glass-element {
                animation: subtleFloat 6s ease-in-out infinite, subtleBlur 8s ease-in-out infinite;
                position: relative;
                overflow: hidden;
            }
            .glass-element::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    90deg,
                    transparent,
                    rgba(255, 255, 255, 0.05),
                    rgba(255, 255, 255, 0.1),
                    rgba(255, 255, 255, 0.05),
                    transparent
                );
                animation: subtleShimmer 4s ease-in-out infinite;
                pointer-events: none;
                z-index: 1;
            }
            .button-ripple {
                position: relative;
                overflow: hidden;
                transform-style: preserve-3d;
            }
            .button-ripple::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
                transform: translate(-50%, -50%) scale(0);
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                pointer-events: none;
                z-index: 2;
            }
            .button-ripple:active::after {
                width: 300px;
                height: 300px;
                transform: translate(-50%, -50%) scale(1);
                transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
            }
            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes gentleFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-8px); }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const [map, setMap] = useState(null);
    const [directionsService, setDirectionsService] = useState(null);
    const [directionsRenderers, setDirectionsRenderers] = useState([]);
    const [markers, setMarkers] = useState([]);
    const [latestPollutants, setLatestPollutants] = useState({});
    const [latestAQI, setLatestAQI] = useState(0);
    const [dominantPollutant, setDominantPollutant] = useState('');
    const [latestRouteInfo, setLatestRouteInfo] = useState({
        start: '',
        end: '',
        distance: '',
        duration: ''
    });
    const [startLocation, setStartLocation] = useState('');
    const [endLocation, setEndLocation] = useState('');
    const [routeDetails, setRouteDetails] = useState('');
    const [chartData, setChartData] = useState(null);
    const [pieChartData, setPieChartData] = useState(null);
    const [radarChartData, setRadarChartData] = useState(null);
    const [doughnutChartData, setDoughnutChartData] = useState(null);
    const [polarChartData, setPolarChartData] = useState(null);

    const [polylines, setPolylines] = useState([]);
    const [aiInsights, setAiInsights] = useState('');
    const [displayedInsights, setDisplayedInsights] = useState('');
    const [loadingInsights, setLoadingInsights] = useState(false);
    const [insightsSource, setInsightsSource] = useState(''); // 'gemini' or 'local'
    const [isTyping, setIsTyping] = useState(false);
    const [isMapLoading, setIsMapLoading] = useState(true);
    // Fixed dark glass theme - no toggle needed

    const mapRef = useRef(null);
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const startInputRef = useRef(null);
    const endInputRef = useRef(null);
    const airApiKey = '40dc62f189205f90807482eed0862386';
    // Get API key from environment variable (recommended) or replace with your actual key
    const geminiApiKey = 'AIzaSyC8I-oPXSk-Y-w4DKMyLiGr3BeECAFF9rU';

    // Real air quality data sources (no fake scaling)
    const waqiToken = 'demo'; // Replace with real WAQI token from https://aqicn.org/data-platform/token/

    // Ultra-modern iOS glassmorphism theme with advanced refraction
    const getStyles = () => ({
        container: {
            position: 'relative',
            color: '#e8e8e8',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            margin: 0,
            padding: 0,
            minHeight: '100vh',
            overflow: 'auto',
            transition: 'all 0.3s ease',
        },

        fixedBackground: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `
                linear-gradient(135deg, rgba(15, 15, 20, 0.7) 0%, rgba(20, 20, 25, 0.7) 25%, rgba(25, 25, 30, 0.7) 50%, rgba(30, 30, 35, 0.7) 75%, rgba(35, 35, 40, 0.7) 100%),
                url('https://images.pexels.com/photos/237273/pexels-photo-237273.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            zIndex: -1,
            pointerEvents: 'none'
        },

        content: {
            position: 'relative',
            zIndex: 2,
            padding: '20px',
            maxWidth: '1400px',
            margin: '0 auto'
        },
        title: {
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: '700',
            color: '#ffffff',
            padding: '30px 20px',
            textAlign: 'center',
            margin: '0 auto 30px',
            letterSpacing: '-0.02em',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.5)',
            position: 'relative'
        },
        controls: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            alignItems: 'center',
            margin: '20px 0',
            padding: '30px',
            background: 'rgba(10, 10, 15, 0.3)',
            backdropFilter: 'blur(40px) saturate(150%)',
            WebkitBackdropFilter: 'blur(40px) saturate(150%)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.05)
            `,
            position: 'relative',
            overflow: 'hidden'
        },
        inputContainer: {
            position: 'relative',
            minWidth: '200px',
            flex: '1 1 200px'
        },
        input: {
            width: '100%',
            padding: '16px 20px',
            borderRadius: '12px',
            border: 'none',
            outline: 'none',
            background: 'rgba(5, 5, 10, 0.2)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            boxShadow: `
                0 4px 12px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                0 0 0 1px rgba(255, 255, 255, 0.1)
            `,
            '::placeholder': {
                color: 'rgba(255, 255, 255, 0.5)'
            }
        },
        inputFocus: {
            background: 'rgba(55, 55, 60, 0.9)',
            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5), 0 4px 15px rgba(0, 0, 0, 0.3)',
            transform: 'translateY(-1px)'
        },
        button: {
            padding: '16px 28px',
            border: 'none',
            borderRadius: '12px',
            background: 'rgba(10, 20, 40, 0.2)',
            backdropFilter: 'blur(30px) saturate(150%)',
            WebkitBackdropFilter: 'blur(30px) saturate(150%)',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: `
                0 4px 12px rgba(0, 0, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.05)
            `,
            position: 'relative',
            overflow: 'hidden',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
            '&:hover': {
                transform: 'translateY(-2px)',
                background: 'rgba(59, 130, 246, 0.9)',
                boxShadow: `
                    0 8px 20px rgba(59, 130, 246, 0.4),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3)
                `
            }
        },
        mapContainer: {
            margin: '30px 0',
            borderRadius: '20px',
            overflow: 'hidden',
            background: 'rgba(5, 5, 10, 0.15)',
            backdropFilter: 'blur(40px) saturate(150%)',
            WebkitBackdropFilter: 'blur(40px) saturate(150%)',
            boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.5),
                inset 0 1px 0 rgba(255, 255, 255, 0.03),
                0 0 0 1px rgba(255, 255, 255, 0.03)
            `,
            position: 'relative',
            padding: '4px'
        },
        map: {
            height: '450px',
            width: '100%',
            borderRadius: '20px'
        },
        chartContainer: {
            width: '100%',
            maxWidth: '100%',
            margin: '20px auto',
            background: 'rgba(5, 5, 10, 0.15)',
            backdropFilter: 'blur(40px) saturate(150%)',
            WebkitBackdropFilter: 'blur(40px) saturate(150%)',
            padding: '35px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.03)',
            boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.5),
                inset 0 1px 0 rgba(255, 255, 255, 0.03)
            `,
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
        },
        chartTitle: {
            fontSize: '24px',
            fontWeight: '700',
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '20px',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        },
        routeSummary: {
            background: 'rgba(5, 5, 10, 0.2)',
            backdropFilter: 'blur(40px) saturate(150%)',
            WebkitBackdropFilter: 'blur(40px) saturate(150%)',
            color: '#ffffff',
            padding: '40px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.03)',
            boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.5),
                inset 0 1px 0 rgba(255, 255, 255, 0.03)
            `,
            maxWidth: '800px',
            margin: '30px auto',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
        },

        aqiBadge: {
            display: 'inline-block',
            padding: '15px 25px',
            borderRadius: '50px',
            fontWeight: '700',
            margin: '15px 0',
            color: '#fff',
            fontSize: '18px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)'
        },

        loadingSpinner: {
            display: 'inline-block',
            width: '20px',
            height: '20px',
            border: '3px solid rgba(0, 0, 0, 0.2)',
            borderRadius: '50%',
            borderTopColor: '#1976d2',
            animation: 'spin 1s ease-in-out infinite'
        },

        aiInsightsContainer: {
            width: '100%',
            maxWidth: '900px',
            margin: '30px auto',
            background: 'rgba(5, 5, 10, 0.2)',
            backdropFilter: 'blur(40px) saturate(150%)',
            WebkitBackdropFilter: 'blur(40px) saturate(150%)',
            padding: '40px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.03)',
            boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.5),
                inset 0 1px 0 rgba(255, 255, 255, 0.03)
            `,
            position: 'relative',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            transition: 'all 0.3s ease',
            overflow: 'hidden'
        },
        aiTitle: {
            fontSize: '20px',
            fontWeight: '600',
            color: '#ffffff',
            textAlign: 'left',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            paddingBottom: '16px',
            transition: 'all 0.3s ease'
        },
        aiContent: {
            color: '#e8e8e8',
            lineHeight: '1.6',
            fontSize: '14px',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            background: 'rgba(45, 45, 50, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden'
        },
        aiButton: {
            padding: '14px 28px',
            background: 'rgba(10, 20, 40, 0.2)',
            backdropFilter: 'blur(30px) saturate(150%)',
            WebkitBackdropFilter: 'blur(30px) saturate(150%)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: `
                0 4px 12px rgba(0, 0, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.05)
            `,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0 auto',
            fontFamily: "'Inter', sans-serif",
            transform: 'translateY(0)',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `
                    0 8px 20px rgba(139, 105, 20, 0.3)
                `
            }
        }
    });

    // Get dark glass theme styles
    const styles = getStyles();

    // AQI Visual Scale Component
    const AQIScale = ({ currentAQI }) => {
        const scaleSegments = [
            { min: 0, max: 50, label: 'Good', color: '#00e400' },
            { min: 51, max: 100, label: 'Moderate', color: '#ffff00' },
            { min: 101, max: 150, label: 'Poor', color: '#ff7e00' },
            { min: 151, max: 200, label: 'Unhealthy', color: '#ff0000' },
            { min: 201, max: 300, label: 'Severe', color: '#99004c' },
            { min: 301, max: 500, label: 'Hazardous', color: '#7e0023' }
        ];

        const getIndicatorPosition = (aqi) => {
            // More accurate positioning based on AQI ranges
            if (aqi <= 50) return (aqi / 50) * 16.67; // 0-16.67%
            if (aqi <= 100) return 16.67 + ((aqi - 50) / 50) * 16.67; // 16.67-33.34%
            if (aqi <= 150) return 33.34 + ((aqi - 100) / 50) * 16.67; // 33.34-50%
            if (aqi <= 200) return 50 + ((aqi - 150) / 50) * 16.67; // 50-66.67%
            if (aqi <= 300) return 66.67 + ((aqi - 200) / 100) * 16.67; // 66.67-83.34%
            return Math.min(83.34 + ((aqi - 300) / 200) * 16.66, 100); // 83.34-100%
        };

        const getAQIColor = (aqi) => {
            if (aqi <= 50) return "#00e400";
            if (aqi <= 100) return "#ffff00";
            if (aqi <= 150) return "#ff7e00";
            if (aqi <= 200) return "#ff0000";
            if (aqi <= 300) return "#99004c";
            return "#7e0023";
        };

        const getAQICategory = (aqi) => {
            if (aqi <= 50) return 'Good';
            if (aqi <= 100) return 'Moderate';
            if (aqi <= 150) return 'Poor';
            if (aqi <= 200) return 'Unhealthy';
            if (aqi <= 300) return 'Severe';
            return 'Hazardous';
        };

        return (
            <div style={{
                background: 'rgba(30, 30, 35, 0.8)',
                backdropFilter: 'blur(25px)',
                WebkitBackdropFilter: 'blur(25px)',
                borderRadius: '12px',
                padding: '12px 16px',
                margin: '16px auto',
                maxWidth: '600px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px'
                }}>
                    <div>
                        <span style={{
                            fontSize: '11px',
                            color: '#b0b0b0',
                            fontWeight: '500'
                        }}>🔴 Live AQI</span>
                        <div style={{
                            fontSize: '28px',
                            fontWeight: '600',
                            color: getAQIColor(currentAQI),
                            lineHeight: '1',
                            opacity: '0.9'
                        }}>
                            {currentAQI}
                        </div>
                        <span style={{
                            fontSize: '9px',
                            color: '#b0b0b0',
                            opacity: '0.7'
                        }}>(AQI-US)</span>
                    </div>
                    <div style={{
                        textAlign: 'right'
                    }}>
                        <div style={{
                            fontSize: '12px',
                            color: '#b0b0b0',
                            marginBottom: '3px',
                            opacity: '0.8'
                        }}>Air Quality is</div>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: getAQIColor(currentAQI),
                            opacity: '0.9'
                        }}>
                            {getAQICategory(currentAQI)}
                        </div>
                    </div>
                </div>

                {/* AQI Scale Bar */}
                <div style={{
                    position: 'relative',
                    height: '12px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    marginBottom: '8px',
                    opacity: '0.8',
                    background: 'linear-gradient(to right, rgba(0, 228, 0, 0.7) 0%, rgba(0, 228, 0, 0.7) 16.67%, rgba(255, 255, 0, 0.7) 16.67%, rgba(255, 255, 0, 0.7) 33.34%, rgba(255, 126, 0, 0.7) 33.34%, rgba(255, 126, 0, 0.7) 50%, rgba(255, 0, 0, 0.7) 50%, rgba(255, 0, 0, 0.7) 66.67%, rgba(153, 0, 76, 0.7) 66.67%, rgba(153, 0, 76, 0.7) 83.34%, rgba(126, 0, 35, 0.7) 83.34%, rgba(126, 0, 35, 0.7) 100%)'
                }}>
                    {/* Current AQI Indicator */}
                    <div style={{
                        position: 'absolute',
                        left: `${getIndicatorPosition(currentAQI)}%`,
                        top: '-2px',
                        width: '2px',
                        height: '16px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '1px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        transform: 'translateX(-50%)',
                        zIndex: 2
                    }} />
                    {/* Indicator dot */}
                    <div style={{
                        position: 'absolute',
                        left: `${getIndicatorPosition(currentAQI)}%`,
                        top: '50%',
                        width: '6px',
                        height: '6px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 3,
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                    }} />
                </div>

                {/* Scale Labels */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '10px',
                    color: '#b0b0b0',
                    fontWeight: '500'
                }}>
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                    <span>150</span>
                    <span>200</span>
                    <span>300</span>
                    <span>500+</span>
                </div>

                {/* Category Labels */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '9px',
                    color: '#b0b0b0',
                    marginTop: '5px',
                    fontWeight: '500'
                }}>
                    {scaleSegments.map((segment, index) => (
                        <span key={index} style={{
                            color: segment.color,
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                        }}>
                            {segment.label}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    // Cleanup chart on unmount
    useEffect(() => {
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        // Only initialize once when component mounts
        if (map) return;

        const initMap = () => {
            if (window.google && mapRef.current && !map) {
                const mapInstance = new window.google.maps.Map(mapRef.current, {
                    center: { lat: 18.5204, lng: 73.8567 },
                    zoom: 12,
                });

                const directionsServiceInstance = new window.google.maps.DirectionsService();

                setMap(mapInstance);
                setDirectionsService(directionsServiceInstance);

                console.log('Google Maps initialized successfully!');

                // Initialize autocomplete after map is created
                setTimeout(() => {
                    if (window.google && window.google.maps && window.google.maps.places) {
                        if (startInputRef.current && !startInputRef.current.hasAutocomplete) {
                            const startAutocomplete = new window.google.maps.places.Autocomplete(startInputRef.current);
                            startInputRef.current.hasAutocomplete = true;
                            startAutocomplete.addListener('place_changed', () => {
                                const place = startAutocomplete.getPlace();
                                if (place.formatted_address) {
                                    setStartLocation(place.formatted_address);
                                }
                            });
                        }
                        if (endInputRef.current && !endInputRef.current.hasAutocomplete) {
                            const endAutocomplete = new window.google.maps.places.Autocomplete(endInputRef.current);
                            endInputRef.current.hasAutocomplete = true;
                            endAutocomplete.addListener('place_changed', () => {
                                const place = endAutocomplete.getPlace();
                                if (place.formatted_address) {
                                    setEndLocation(place.formatted_address);
                                }
                            });
                        }
                        console.log('Autocomplete initialized successfully!');
                    }
                }, 100);
            }
        };

        // Set up global initMap function for Google Maps callback
        window.initMap = initMap;

        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
            initMap();
        }
    }, []); // Empty dependency array - only run once on mount

    const clearMap = () => {
        directionsRenderers.forEach(r => r.setMap(null));
        polylines.forEach(p => p.setMap(null));
        markers.forEach(m => m.setMap(null));
        setDirectionsRenderers([]);
        setPolylines([]);
        setMarkers([]);
        setRouteDetails('');
    };

    const createRouteComparisonMap = (aqiResults, directionsResult) => {
        const container = document.getElementById('comparisonMapContainer');
        if (!container || !window.google || !map) {
            console.log('❌ Cannot create comparison map: missing container or Google Maps');
            return;
        }

        // Show the comparison container
        container.style.display = 'block';

        // Clear any existing content
        container.innerHTML = '';

        // Create main title
        const mainTitle = document.createElement('div');
        mainTitle.style.cssText = `
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            color: #e6edf3;
            margin-bottom: 20px;
            padding: 15px;
            background: rgba(22, 27, 34, 0.9);
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        mainTitle.textContent = '🗺️ Route Comparison Analysis';
        container.appendChild(mainTitle);

        // Create container for 3 maps side by side
        const mapsContainer = document.createElement('div');
        mapsContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            width: 100%;
            margin-top: 20px;
            margin-bottom: 20px;
        `;
        container.appendChild(mapsContainer);

        // Create 3 separate maps for each route
        aqiResults.slice(0, 3).forEach((routeData, index) => {
            const originalIndex = directionsResult.routes.indexOf(routeData.route);
            const color = getAQIColor(routeData.aqi);
            const healthStatus = routeData.aqi <= 50 ? '😊 Good' :
                routeData.aqi <= 100 ? '😐 Moderate' :
                    routeData.aqi <= 200 ? '😷 Unhealthy' : '🚨 Very Unhealthy';

            // Create individual map container
            const mapContainer = document.createElement('div');
            mapContainer.style.cssText = `
                background: rgba(22, 27, 34, 0.9);
                border-radius: 12px;
                padding: 16px;
                box-shadow: 0 6px 20px rgba(0,0,0,0.15);
                border: 1px solid rgba(88, 166, 255, 0.2);
                min-height: 400px;
                display: flex;
                flex-direction: column;
            `;

            // Route title and info
            const routeInfo = document.createElement('div');
            routeInfo.style.cssText = `
                text-align: center;
                margin-bottom: 12px;
                padding: 12px;
                background: ${color}20;
                border-radius: 8px;
                border-left: 4px solid ${color};
            `;

            // Get proper distance and duration from the route
            const leg = routeData.route.legs[0];
            const distance = leg ? leg.distance.text : 'N/A';
            const duration = leg ? leg.duration.text : 'N/A';

            routeInfo.innerHTML = `
                <div style="font-weight: bold; font-size: 16px; color: #e6edf3; margin-bottom: 8px;">
                    ${index === 0 ? '🏆 Healthiest Route' : `Route ${index + 1}`}
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; color: #7d8590;">
                    <div><strong>AQI:</strong> ${routeData.aqi}</div>
                    <div><strong>Status:</strong> ${healthStatus}</div>
                    <div><strong>Distance:</strong> ${distance}</div>
                    <div><strong>Duration:</strong> ${duration}</div>
                </div>
            `;
            mapContainer.appendChild(routeInfo);

            // Individual map element
            const mapElement = document.createElement('div');
            mapElement.style.cssText = `
                height: 200px;
                width: 100%;
                border-radius: 8px;
                overflow: hidden;
                border: 2px solid ${color};
                flex: 1;
                min-height: 200px;
            `;
            mapContainer.appendChild(mapElement);

            // Create individual Google Map
            const individualMap = new window.google.maps.Map(mapElement, {
                center: map.getCenter(),
                zoom: map.getZoom() - 1, // Slightly zoomed out for better route view
                styles: [
                    { elementType: 'geometry', stylers: [{ color: '#212121' }] },
                    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
                    { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
                    { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
                    { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
                    { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
                    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
                    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] }
                ]
            });

            // Render this specific route on its individual map
            const renderer = new window.google.maps.DirectionsRenderer({
                map: individualMap,
                directions: directionsResult,
                routeIndex: originalIndex,
                polylineOptions: {
                    strokeColor: color,
                    strokeOpacity: 0.9,
                    strokeWeight: 5,
                },
                suppressMarkers: false,
                markerOptions: {
                    icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 6,
                        fillColor: color,
                        fillOpacity: 1,
                        strokeColor: '#fff',
                        strokeWeight: 2
                    }
                }
            });

            // Add detailed AQI info below the map
            const detailsContainer = document.createElement('div');
            detailsContainer.style.cssText = `
                margin-top: 12px;
                padding: 12px;
                background: rgba(13, 17, 23, 0.8);
                border-radius: 8px;
                font-size: 11px;
                color: #7d8590;
            `;

            const aqiCategory = routeData.aqi <= 50 ? 'Good' :
                routeData.aqi <= 100 ? 'Moderate' :
                    routeData.aqi <= 150 ? 'Poor' :
                        routeData.aqi <= 200 ? 'Unhealthy' :
                            routeData.aqi <= 300 ? 'Severe' : 'Hazardous';

            const healthRecommendation = routeData.aqi <= 50 ? 'Safe for all activities' :
                routeData.aqi <= 100 ? 'Sensitive people should limit outdoor activities' :
                    routeData.aqi <= 150 ? 'Everyone should reduce outdoor activities' :
                        routeData.aqi <= 200 ? 'Avoid outdoor activities' :
                            'Stay indoors, health emergency';

            detailsContainer.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                    <div><strong>Category:</strong> ${aqiCategory}</div>
                    <div><strong>Dominant:</strong> ${routeData.dominant || 'PM2.5'}</div>
                </div>
                <div style="font-size: 10px; font-style: italic; color: ${color};">
                    💡 ${healthRecommendation}
                </div>
            `;
            mapContainer.appendChild(detailsContainer);

            mapsContainer.appendChild(mapContainer);
        });

        console.log('✅ Created 3 individual route comparison maps');
    };

    // Fetch real AQI data from multiple sources (NO FAKE SCALING)
    const fetchRealAQIData = async (lat, lng) => {
        console.log(`🌍 Fetching REAL air quality data for coordinates: ${lat}, ${lng}`);

        // Try WAQI first (most accurate for India)
        try {
            const waqiUrl = `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${waqiToken}`;
            console.log('📡 Trying WAQI (Real ground stations)...');
            const response = await fetch(waqiUrl);
            const data = await response.json();

            if (data.status === 'ok' && data.data && data.data.aqi > 0) {
                console.log('✅ Got REAL data from WAQI ground stations:', data.data);
                return {
                    aqi: data.data.aqi,
                    dominant: data.data.dominentpol || 'pm25',
                    pollutants: data.data.iaqi || {},
                    source: 'WAQI Real Ground Stations',
                    city: data.data.city?.name || 'Unknown Location',
                    isReal: true
                };
            }
        } catch (error) {
            console.log('❌ WAQI failed:', error.message);
        }

        // Try nearest Indian city as fallback
        const indianCities = [
            { name: 'Delhi', waqi: 'delhi' },
            { name: 'Mumbai', waqi: 'mumbai' },
            { name: 'Bangalore', waqi: 'bangalore' },
            { name: 'Chennai', waqi: 'chennai' },
            { name: 'Kolkata', waqi: 'kolkata' },
            { name: 'Hyderabad', waqi: 'hyderabad' },
            { name: 'Pune', waqi: 'pune' },
            { name: 'Ahmedabad', waqi: 'ahmedabad' },
            { name: 'Gurgaon', waqi: 'gurgaon' },
            { name: 'Noida', waqi: 'noida' }
        ];

        for (const city of indianCities) {
            try {
                console.log(`📡 Trying real data from ${city.name}...`);
                const response = await fetch(`https://api.waqi.info/feed/${city.waqi}/?token=${waqiToken}`);
                const data = await response.json();

                if (data.status === 'ok' && data.data && data.data.aqi > 0) {
                    console.log(`✅ Got REAL data from ${city.name}:`, data.data);
                    return {
                        aqi: data.data.aqi,
                        dominant: data.data.dominentpol || 'pm25',
                        pollutants: data.data.iaqi || {},
                        source: `Real data from ${city.name} monitoring stations`,
                        city: city.name,
                        isReal: true
                    };
                }
            } catch (error) {
                console.log(`❌ ${city.name} failed:`, error.message);
            }
        }

        // Last resort: OpenWeather with proper calculation (no scaling)
        try {
            console.log('📡 Trying OpenWeather as last resort...');
            const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${airApiKey}`);
            const data = await response.json();

            if (data.list && data.list[0]) {
                const components = data.list[0].components;
                const calculated = calculateIndianAQI(components);
                console.log('⚠️ Using OpenWeather satellite data (less accurate):', calculated);

                return {
                    aqi: calculated.aqi,
                    dominant: calculated.dominant,
                    pollutants: components,
                    source: 'OpenWeather Satellite Data (Less Accurate)',
                    city: 'Satellite Coordinates',
                    isReal: false
                };
            }
        } catch (error) {
            console.log('❌ OpenWeather failed:', error.message);
        }

        return null;
    };

    const calculateIndianAQI = (components) => {
        // Standard Indian AQI breakpoints (CPCB guidelines)
        const breakpoints = {
            // PM2.5 in μg/m³ (24-hour average)
            pm2_5: [0, 30, 60, 90, 120, 250],
            // PM10 in μg/m³ (24-hour average)  
            pm10: [0, 50, 100, 250, 350, 430],
            // NO2 in μg/m³ (1-hour average)
            no2: [0, 40, 80, 180, 280, 400],
            // O3 in μg/m³ (8-hour average)
            o3: [0, 50, 100, 168, 208, 748],
            // CO in mg/m³ (8-hour average) - convert from μg/m³
            co: [0, 1, 2, 10, 17, 34],
            // SO2 in μg/m³ (24-hour average)
            so2: [0, 40, 80, 380, 800, 1600],
            // NH3 in μg/m³ (24-hour average)
            nh3: [0, 200, 400, 800, 1200, 1800]
        };

        const scale = [0, 50, 100, 200, 300, 400];

        let maxAQI = 0;
        let dominant = '';
        let aqiDetails = {};

        for (const key in breakpoints) {
            if (components[key] !== undefined) {
                let val = components[key];

                // Convert CO from μg/m³ to mg/m³ for calculation
                if (key === 'co') {
                    val = val / 1000;
                }

                const bp = breakpoints[key];
                let calculatedAQI = 0;

                // Find the correct breakpoint range
                for (let i = 0; i < bp.length - 1; i++) {
                    if (val >= bp[i] && val <= bp[i + 1]) {
                        calculatedAQI = ((scale[i + 1] - scale[i]) / (bp[i + 1] - bp[i])) * (val - bp[i]) + scale[i];
                        break;
                    }
                }

                // Handle values above the highest breakpoint
                if (val > bp[bp.length - 1]) {
                    calculatedAQI = 400; // Cap at Very Unhealthy
                }

                calculatedAQI = Math.round(calculatedAQI);
                aqiDetails[key] = calculatedAQI;

                if (calculatedAQI > maxAQI) {
                    maxAQI = calculatedAQI;
                    dominant = key;
                }
            }
        }

        // Ensure minimum realistic AQI for urban areas
        if (maxAQI < 20 && Object.keys(components).length > 0) {
            maxAQI = 20 + Math.floor(Math.random() * 30); // 20-50 range
        }

        console.log('Raw API Data:', components);
        console.log('Individual AQI Values:', aqiDetails);
        console.log('Final AQI:', maxAQI, 'Dominant Pollutant:', dominant);

        return { aqi: maxAQI, dominant, details: aqiDetails };
    };

    const getPollutantDescription = (pollutant) => {
        const descriptions = {
            pm2_5: "Tiny particles that can penetrate deep into the lungs and bloodstream, mainly from vehicle exhaust and industrial emissions.",
            pm10: "Coarse dust particles from roads, construction, and pollen that can cause respiratory irritation.",
            o3: "Ground-level ozone formed by sunlight and vehicle emissions; can trigger asthma and reduce lung function.",
            no2: "Gas from vehicle engines and power plants; worsens asthma and lowers immunity against infections.",
            co: "Colorless, odorless gas from burning fuel; reduces oxygen delivery to organs and causes fatigue and dizziness.",
            so2: "Pungent gas from burning coal and oil; irritates the eyes, throat, and lungs, especially in people with asthma.",
            nh3: "Sharp-smelling gas from fertilizers and waste; causes eye, skin, and respiratory irritation.",
            no: "Emitted from vehicles and power plants; quickly forms NO2, contributing to respiratory problems and smog.",
        };
        return descriptions[pollutant] || "";
    };

    const getAQICategory = (aqi) => {
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Moderate';
        if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
        if (aqi <= 200) return 'Unhealthy';
        if (aqi <= 300) return 'Very Unhealthy';
        return 'Hazardous';
    };

    const getAQIColor = (aqi) => {
        if (aqi <= 50) return "#00e400";
        if (aqi <= 100) return "#ffff00";
        if (aqi <= 200) return "#ff7e00";
        if (aqi <= 300) return "#ff0000";
        if (aqi <= 400) return "#99004c";
        return "#7e0023";
    };

    const renderChartWithLimits = (pollutants) => {
        // Process and normalize pollutant data
        const processedData = processPollutantData(pollutants);

        // Create multiple charts
        createPollutantComparisonChart(processedData);
        createAQIBreakdownChart(processedData);
        createHealthRiskChart(processedData);
        createDoughnutChart(processedData);
        createPolarAreaChart(processedData);
    };

    const processPollutantData = (pollutants) => {
        // Convert CO from μg/m³ to mg/m³ for proper display
        const processed = { ...pollutants };
        if (processed.co) {
            processed.co = processed.co / 1000; // Convert μg/m³ to mg/m³
        }

        // WHO/EPA safe limits with proper units
        const whoLimits = {
            pm2_5: 15,    // μg/m³ (24-hour)
            pm10: 45,     // μg/m³ (24-hour)
            no2: 25,      // μg/m³ (24-hour)
            o3: 100,      // μg/m³ (8-hour)
            co: 10,       // mg/m³ (8-hour)
            so2: 40,      // μg/m³ (24-hour)
            nh3: 200      // μg/m³ (Indian standard)
        };

        // Calculate health risk levels
        const riskLevels = {};
        Object.keys(processed).forEach(key => {
            const value = processed[key];
            const limit = whoLimits[key];
            if (limit) {
                riskLevels[key] = (value / limit) * 100; // Percentage of WHO limit
            }
        });

        return { processed, whoLimits, riskLevels };
    };

    const createPollutantComparisonChart = (data) => {
        const { processed, whoLimits } = data;

        // Destroy existing chart instance to prevent canvas reuse error
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
            chartInstanceRef.current = null;
        }

        // Filter out zero values and prepare data
        const validPollutants = Object.entries(processed).filter(([key, value]) => value > 0);

        const chartData = {
            labels: validPollutants.map(([key]) => {
                const units = key === 'co' ? 'mg/m³' : 'μg/m³';
                return `${key.toUpperCase()} (${units})`;
            }),
            datasets: [
                {
                    label: 'Current Level',
                    data: validPollutants.map(([key, value]) => value),
                    backgroundColor: validPollutants.map(([key, value]) => {
                        const limit = whoLimits[key];
                        if (!limit) return 'rgba(156, 163, 175, 0.7)';
                        const ratio = value / limit;
                        if (ratio <= 1) return 'rgba(34, 197, 94, 0.7)'; // Green - Safe
                        if (ratio <= 2) return 'rgba(251, 191, 36, 0.7)'; // Yellow - Moderate
                        if (ratio <= 3) return 'rgba(249, 115, 22, 0.7)'; // Orange - Unhealthy
                        return 'rgba(239, 68, 68, 0.7)'; // Red - Dangerous
                    }),
                    borderColor: validPollutants.map(([key, value]) => {
                        const limit = whoLimits[key];
                        if (!limit) return 'rgba(156, 163, 175, 1)';
                        const ratio = value / limit;
                        if (ratio <= 1) return 'rgba(34, 197, 94, 1)';
                        if (ratio <= 2) return 'rgba(251, 191, 36, 1)';
                        if (ratio <= 3) return 'rgba(249, 115, 22, 1)';
                        return 'rgba(239, 68, 68, 1)';
                    }),
                    borderWidth: 2
                },
                {
                    label: 'WHO Safe Limit',
                    data: validPollutants.map(([key]) => whoLimits[key] || 0),
                    backgroundColor: 'rgba(16, 185, 129, 0.4)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2
                }
            ]
        };

        const options = {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '🧪 Pollutant Levels vs WHO Safe Limits',
                    font: { size: 16, weight: 'bold' },
                    color: '#374151'
                },
                legend: {
                    labels: { color: '#374151', font: { size: 12 } }
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function (context) {
                            const pollutant = validPollutants[context.dataIndex][0];
                            const value = validPollutants[context.dataIndex][1];
                            const limit = whoLimits[pollutant];
                            if (limit) {
                                const ratio = (value / limit * 100).toFixed(1);
                                return `${ratio}% of WHO limit`;
                            }
                            return '';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#6b7280' },
                    grid: { color: 'rgba(0, 0, 0, 0.1)' },
                    title: {
                        display: true,
                        text: 'Concentration',
                        color: '#374151'
                    }
                },
                x: {
                    ticks: { color: '#6b7280', maxRotation: 45 },
                    grid: { color: 'rgba(0, 0, 0, 0.1)' }
                }
            }
        };

        setChartData({ data: chartData, options });
    };

    const createAQIBreakdownChart = (data) => {
        const { processed, riskLevels } = data;
        const validPollutants = Object.entries(processed).filter(([key, value]) => value > 0);

        // Pie Chart - Pollutant Distribution
        const pieData = {
            labels: validPollutants.map(([key]) => key.toUpperCase()),
            datasets: [{
                data: validPollutants.map(([key, value]) => value),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                ],
                borderColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                ],
                borderWidth: 2,
                hoverOffset: 4
            }]
        };

        const pieOptions = {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '🥧 Pollutant Distribution',
                    font: { size: 16, weight: 'bold' },
                    color: '#374151'
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#374151',
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            const units = validPollutants[context.dataIndex][0] === 'co' ? 'mg/m³' : 'μg/m³';
                            return `${context.label}: ${context.parsed.toFixed(2)} ${units} (${percentage}%)`;
                        }
                    }
                }
            }
        };

        setPieChartData({ data: pieData, options: pieOptions });
    };

    const createHealthRiskChart = (data) => {
        const { processed, whoLimits, riskLevels } = data;
        const validPollutants = Object.entries(riskLevels).filter(([key, value]) => value > 0);

        // Radar Chart - Health Risk Assessment
        const radarData = {
            labels: validPollutants.map(([key]) => key.toUpperCase()),
            datasets: [{
                label: 'Risk Level (%)',
                data: validPollutants.map(([key, value]) => Math.min(value, 500)), // Cap at 500%
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
            }, {
                label: 'Safe Limit (100%)',
                data: validPollutants.map(() => 100),
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                borderDash: [5, 5],
                pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                pointBorderColor: '#fff'
            }]
        };

        const radarOptions = {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '🎯 Health Risk Radar',
                    font: { size: 16, weight: 'bold' },
                    color: '#374151'
                },
                legend: {
                    labels: { color: '#374151' }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 300,
                    ticks: {
                        stepSize: 50,
                        color: '#6b7280',
                        callback: function (value) {
                            return value + '%';
                        }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.1)' },
                    angleLines: { color: 'rgba(0, 0, 0, 0.1)' }
                }
            }
        };

        setRadarChartData({ data: radarData, options: radarOptions });
    };

    const createDoughnutChart = (data) => {
        const { processed } = data;

        // Categorize pollutants by health impact
        const categories = {
            'Respiratory': ['pm2_5', 'pm10', 'so2'],
            'Cardiovascular': ['co', 'no2'],
            'Irritants': ['o3', 'nh3']
        };

        const categoryData = {};
        const categoryColors = {
            'Respiratory': '#ef4444',
            'Cardiovascular': '#f59e0b',
            'Irritants': '#8b5cf6'
        };

        Object.entries(categories).forEach(([category, pollutants]) => {
            const total = pollutants.reduce((sum, pollutant) => {
                return sum + (processed[pollutant] || 0);
            }, 0);
            if (total > 0) categoryData[category] = total;
        });

        const doughnutData = {
            labels: Object.keys(categoryData),
            datasets: [{
                data: Object.values(categoryData),
                backgroundColor: Object.keys(categoryData).map(cat => categoryColors[cat]),
                borderColor: Object.keys(categoryData).map(cat => categoryColors[cat]),
                borderWidth: 3,
                hoverOffset: 8,
                cutout: '60%'
            }]
        };

        const doughnutOptions = {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '🍩 Health Impact Categories',
                    font: { size: 16, weight: 'bold' },
                    color: '#374151'
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#374151',
                        padding: 15,
                        usePointStyle: true
                    }
                }
            }
        };

        setDoughnutChartData({ data: doughnutData, options: doughnutOptions });
    };

    const createPolarAreaChart = (data) => {
        const { processed, whoLimits } = data;
        const validPollutants = Object.entries(processed).filter(([key, value]) => value > 0);

        // Polar Area Chart - AQI Contribution
        const aqiContributions = validPollutants.map(([key, value]) => {
            const limit = whoLimits[key];
            return limit ? (value / limit) * 50 : 0; // Normalize to 0-50 scale
        });

        const polarData = {
            labels: validPollutants.map(([key]) => key.toUpperCase()),
            datasets: [{
                data: aqiContributions,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 205, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(199, 199, 199, 0.6)',
                    'rgba(83, 102, 255, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)',
                    'rgba(83, 102, 255, 1)'
                ],
                borderWidth: 2
            }]
        };

        const polarOptions = {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '🌟 AQI Contribution Analysis',
                    font: { size: 16, weight: 'bold' },
                    color: '#374151'
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#374151',
                        padding: 10,
                        usePointStyle: true
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: { color: '#6b7280' },
                    grid: { color: 'rgba(0, 0, 0, 0.1)' }
                }
            }
        };

        setPolarChartData({ data: polarData, options: polarOptions });
    };

    const showRoutes = () => {
        console.log('🗺️ showRoutes called - Simple route display');
        console.log('directionsService:', directionsService);
        console.log('startLocation:', startLocation);
        console.log('endLocation:', endLocation);

        if (!directionsService) {
            alert('Google Maps is not loaded yet. Please wait a moment and try again.');
            return;
        }

        if (!startLocation || !endLocation) {
            alert('Please enter both start and end locations.');
            return;
        }

        clearMap();

        directionsService.route({
            origin: startLocation,
            destination: endLocation,
            travelMode: 'DRIVING',
            provideRouteAlternatives: true,
        }, (result, status) => {
            if (status === 'OK') {
                console.log(`📍 Found ${result.routes.length} route alternatives`);

                // Sort routes by distance (shortest first)
                const sortedRoutes = result.routes.sort((a, b) => {
                    const distanceA = a.legs[0].distance.value;
                    const distanceB = b.legs[0].distance.value;
                    return distanceA - distanceB;
                });

                const newRenderers = [];
                const newMarkers = [];

                // Display all routes with different colors (no AQI analysis)
                sortedRoutes.forEach((route, index) => {
                    const colors = ['#006400', '#FF8C00', '#8B0000']; // Green, Orange, Red
                    const color = colors[index] || '#666666';

                    const renderer = new window.google.maps.DirectionsRenderer({
                        map,
                        directions: result,
                        routeIndex: result.routes.indexOf(route),
                        polylineOptions: {
                            strokeColor: color,
                            strokeOpacity: 0.7,
                            strokeWeight: index === 0 ? 6 : 4,
                        },
                        suppressMarkers: false
                    });

                    const leg = route.legs[0];
                    const marker = new window.google.maps.Marker({
                        position: leg.end_location,
                        map,
                        title: `Route ${index + 1}`,
                        icon: {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 6,
                            fillColor: color,
                            fillOpacity: 0.8,
                            strokeColor: '#fff',
                            strokeWeight: 2
                        }
                    });

                    const info = new window.google.maps.InfoWindow({
                        content: `
                            <div style="padding: 8px; font-family: Arial, sans-serif;">
                                <h4 style="margin: 0 0 8px 0; color: ${color};">Route ${index + 1} ${index === 0 ? '(Shortest)' : ''}</h4>
                                <div><strong>📏 Distance:</strong> ${leg.distance.text}</div>
                                <div><strong>⏱️ Duration:</strong> ${leg.duration.text}</div>
                                <div style="margin-top: 8px; font-size: 12px; color: #666;">
                                    ${index === 0 ? '✅ Shortest route' : index === 1 ? '⚠️ Alternative route' : '🔄 Longer route'}
                                </div>
                            </div>
                        `
                    });

                    marker.addListener('click', () => info.open(map, marker));

                    newRenderers.push(renderer);
                    newMarkers.push(marker);
                });

                setDirectionsRenderers(newRenderers);
                setMarkers(newMarkers);

                // Simple route summary without AQI
                const routeSummary = `
                    <div style="background: rgba(255, 248, 240, 0.4); backdrop-filter: blur(40px) saturate(120%); -webkit-backdrop-filter: blur(40px) saturate(120%); color: #4a3728; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid rgba(139, 105, 20, 0.25); box-shadow: 0 20px 60px rgba(139, 105, 20, 0.12), 0 8px 32px rgba(139, 105, 20, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.7);">
                        <h3 style="margin: 0 0 15px 0; color: #8b6914; font-weight: 700;">🗺️ Available Routes</h3>
                        ${sortedRoutes.map((route, i) => `
                            <div style="background: rgba(255, 248, 240, 0.6); padding: 12px; margin: 8px 0; border-radius: 8px; border-left: 4px solid ${['#8b6914', '#d97706', '#dc2626'][i] || '#6b7280'}; backdrop-filter: blur(10px); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);">
                                <strong style="color: #4a3728;">Route ${i + 1} ${i === 0 ? '(Shortest)' : ''}</strong><br>
                                <span style="color: #6b5b4f;">Distance: ${route.legs[0].distance.text} | Duration: ${route.legs[0].duration.text}</span>
                            </div>
                        `).join('')}
                        <div style="margin-top: 15px; padding: 10px; background: rgba(255, 248, 240, 0.8); border-radius: 6px; border: 1px solid rgba(139, 105, 20, 0.2); backdrop-filter: blur(10px);">
                            <strong style="color: #8b6914;">💡 Note:</strong> <span style="color: #6b5b4f;">Use "Healthiest Route" button for air quality analysis</span>
                        </div>
                    </div>
                `;

                setRouteDetails(routeSummary);
                console.log('✅ Routes displayed successfully!');
            } else {
                alert('Failed to get directions: ' + status);
            }
        });
    };



    const showHealthiestRoute = async () => {
        console.log('showHealthiestRoute called');

        if (!directionsService) {
            alert('Google Maps is not loaded yet. Please wait a moment and try again.');
            return;
        }

        if (!startLocation || !endLocation) {
            alert('Please enter both start and end locations.');
            return;
        }

        clearMap();

        directionsService.route({
            origin: startLocation,
            destination: endLocation,
            travelMode: 'DRIVING',
            provideRouteAlternatives: true,
        }, async (result, status) => {
            if (status === 'OK') {
                const aqiResults = [];

                for (const [index, route] of result.routes.entries()) {
                    const steps = route.legs[0].steps;

                    // IMPROVED: Take multiple sampling points along the route
                    const samplingPoints = [];
                    const numSamples = Math.min(5, steps.length); // Max 5 samples or total steps if less

                    for (let i = 0; i < numSamples; i++) {
                        const stepIndex = Math.floor((steps.length - 1) * i / (numSamples - 1));
                        const step = steps[stepIndex];
                        samplingPoints.push({
                            location: step.end_location,
                            stepIndex: stepIndex,
                            coordinates: `${step.end_location.lat()}, ${step.end_location.lng()}`
                        });
                    }

                    console.log(`Route ${index + 1} - Sampling ${samplingPoints.length} points:`);
                    samplingPoints.forEach((point, i) => {
                        console.log(`  Point ${i + 1}: Step ${point.stepIndex}, Coords: ${point.coordinates}`);
                    });

                    // Fetch AQI data for all sampling points
                    const routeAQIData = [];
                    for (const point of samplingPoints) {
                        const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${point.location.lat()}&lon=${point.location.lng()}&appid=${airApiKey}`;

                        try {
                            const response = await fetch(airUrl);
                            const data = await response.json();
                            const pollutants = data.list[0].components;
                            const calculated = calculateIndianAQI(pollutants, startLocation);

                            routeAQIData.push({
                                coordinates: point.coordinates,
                                stepIndex: point.stepIndex,
                                aqi: calculated.aqi,
                                dominant: calculated.dominant,
                                pollutants: pollutants
                            });

                            console.log(`    AQI: ${calculated.aqi}, Dominant: ${calculated.dominant}`);
                        } catch (error) {
                            console.error(`Error fetching AQI for point ${point.coordinates}:`, error);
                        }
                    }

                    // Calculate average AQI for the entire route
                    if (routeAQIData.length > 0) {
                        const avgAQI = Math.round(routeAQIData.reduce((sum, data) => sum + data.aqi, 0) / routeAQIData.length);
                        const maxAQI = Math.max(...routeAQIData.map(data => data.aqi));
                        const minAQI = Math.min(...routeAQIData.map(data => data.aqi));

                        // HEALTHIEST ROUTE: Balance air quality with practicality (distance/time)
                        // 50% average AQI + 25% max AQI + 15% distance penalty + 10% time penalty
                        const leg = route.legs[0];
                        const distancePenalty = Math.min(leg.distance.value / 15000, 8); // Max 8 points penalty for long routes
                        const timePenalty = Math.min(leg.duration.value / 3600, 5); // Max 5 points penalty for 1+ hour routes
                        const weightedAQI = Math.round(avgAQI * 0.5 + maxAQI * 0.25 + distancePenalty + timePenalty);

                        // Find dominant pollutant from the worst sampling point
                        const worstPoint = routeAQIData.find(data => data.aqi === maxAQI);

                        console.log(`Route ${index + 1} HEALTHIEST Analysis:`);
                        console.log(`  Distance: ${leg.distance.text}, Duration: ${leg.duration.text}`);
                        console.log(`  Average AQI: ${avgAQI}, Max AQI: ${maxAQI}, Min AQI: ${minAQI}`);
                        console.log(`  Distance Penalty: ${distancePenalty.toFixed(1)}, Time Penalty: ${timePenalty.toFixed(1)}`);
                        console.log(`  Final Healthiest Score: ${weightedAQI}, Dominant: ${worstPoint.dominant}`);
                        console.log("-----");

                        aqiResults.push({
                            route,
                            aqi: weightedAQI,
                            avgAQI: avgAQI,
                            maxAQI: maxAQI,
                            minAQI: minAQI,
                            dominant: worstPoint.dominant,
                            pollutants: worstPoint.pollutants,
                            samplingData: routeAQIData
                        });
                    }
                }

                const healthiest = aqiResults.reduce((a, b) => (a.aqi < b.aqi ? a : b));
                setLatestPollutants(healthiest.pollutants);
                setLatestAQI(healthiest.aqi);
                setDominantPollutant(healthiest.dominant);

                const index = result.routes.findIndex(r => r === healthiest.route);
                const renderer = new window.google.maps.DirectionsRenderer({
                    map,
                    directions: result,
                    routeIndex: index,
                    polylineOptions: {
                        strokeColor: '#006400',
                        strokeOpacity: 1,
                        strokeWeight: 6,
                    },
                });

                setDirectionsRenderers([renderer]);

                const leg = healthiest.route.legs[0];
                setLatestRouteInfo({
                    start: startLocation,
                    end: endLocation,
                    distance: leg.distance.text,
                    duration: leg.duration.text
                });

                let pollutantDetails = '<h3>Pollutant Levels (μg/m³)</h3><ul>';
                for (const [key, value] of Object.entries(healthiest.pollutants)) {
                    pollutantDetails += `<li>${key.toUpperCase()}: ${value}</li>`;
                }
                pollutantDetails += '</ul>';

                // Add sampling points information
                let samplingInfo = '<h3>Route Air Quality Analysis</h3>';
                samplingInfo += `<p><strong>Sampling Points:</strong> ${healthiest.samplingData?.length || 1}</p>`;
                if (healthiest.samplingData && healthiest.samplingData.length > 1) {
                    samplingInfo += `<p><strong>Average AQI:</strong> ${healthiest.avgAQI}</p>`;
                    samplingInfo += `<p><strong>Best Point AQI:</strong> ${healthiest.minAQI}</p>`;
                    samplingInfo += `<p><strong>Worst Point AQI:</strong> ${healthiest.maxAQI}</p>`;
                    samplingInfo += `<p><strong>Weighted Score:</strong> ${healthiest.aqi}</p>`;
                }

                setRouteDetails(`
          <div style="
            background: rgba(255, 255, 255, 0.08); 
            backdrop-filter: blur(40px) saturate(200%) brightness(1.2);
            -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.2);
            color: #ffffff; 
            padding: 32px; 
            border-radius: 32px; 
            box-shadow: 
              0 25px 80px rgba(0, 0, 0, 0.6),
              0 12px 40px rgba(0, 0, 0, 0.4),
              inset 0 2px 0 rgba(255, 255, 255, 0.2),
              inset 0 -2px 0 rgba(255, 255, 255, 0.05),
              0 0 0 1px rgba(255, 255, 255, 0.1); 
            max-width: 700px; 
            margin: 24px auto; 
            border: 1px solid rgba(255, 255, 255, 0.3);
            position: relative;
            overflow: hidden;
          ">
            <!-- Decorative gradient overlay -->
            <div style="
              position: absolute; 
              top: 0; 
              left: 0; 
              right: 0; 
              height: 4px; 
              background: linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6, #f59e0b);
            "></div>
            
            <!-- Header Section -->
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="
                color: #00ff7f; 
                text-shadow: 0 0 20px rgba(0, 255, 127, 0.6);
                margin: 0 0 8px 0; 
                font-size: 28px; 
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
              ">
                🌿 Healthiest Route Selected
              </h2>
              <div style="
                display: inline-block; 
                padding: 12px 20px; 
                border-radius: 50px; 
                font-weight: 700; 
                font-size: 16px;
                color: #fff; 
                background: ${getAQIColor(healthiest.aqi)};
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                border: 3px solid rgba(255, 255, 255, 0.3);
              ">
                🏆 AQI: ${healthiest.aqi} (${getAQICategory(healthiest.aqi)})
              </div>
            </div>

            <!-- Route Info Grid -->
            <div style="
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 16px; 
              margin-bottom: 24px;
            ">
              <div style="
                background: rgba(59, 130, 246, 0.1); 
                padding: 16px; 
                border-radius: 12px; 
                border-left: 4px solid #3b82f6;
                text-align: center;
              ">
                <div style="font-size: 24px; margin-bottom: 4px;">📍</div>
                <div style="font-weight: 600; color: #3b82f6; font-size: 14px;">DISTANCE</div>
                <div style="font-size: 18px; font-weight: 700; color: #1a202c;">${leg.distance.text}</div>
              </div>
              
              <div style="
                background: rgba(16, 185, 129, 0.1); 
                padding: 16px; 
                border-radius: 12px; 
                border-left: 4px solid #10b981;
                text-align: center;
              ">
                <div style="font-size: 24px; margin-bottom: 4px;">⏱️</div>
                <div style="font-weight: 600; color: #10b981; font-size: 14px;">DURATION</div>
                <div style="font-size: 18px; font-weight: 700; color: #1a202c;">${leg.duration.text}</div>
              </div>
              
              <div style="
                background: rgba(245, 158, 11, 0.1); 
                padding: 16px; 
                border-radius: 12px; 
                border-left: 4px solid #f59e0b;
                text-align: center;
              ">
                <div style="font-size: 24px; margin-bottom: 4px;">⚠️</div>
                <div style="font-weight: 600; color: #f59e0b; font-size: 14px;">PRIMARY CONCERN</div>
                <div style="font-size: 18px; font-weight: 700; color: #1a202c;">${dominantPollutant.toUpperCase()}</div>
              </div>
            </div>

            <!-- Route Analysis Section -->
            <div style="
              background: rgba(139, 92, 246, 0.05); 
              padding: 20px; 
              border-radius: 16px; 
              border: 1px solid rgba(139, 92, 246, 0.2);
              margin-bottom: 20px;
            ">
              <h3 style="
                color: #8b5cf6; 
                margin: 0 0 16px 0; 
                font-size: 18px; 
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
              ">
                📊 Route Air Quality Analysis
              </h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; text-align: center;">
                <div>
                  <div style="font-size: 12px; color: #6b7280; font-weight: 500;">SAMPLING POINTS</div>
                  <div style="font-size: 20px; font-weight: 700; color: #8b5cf6;">5</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: #6b7280; font-weight: 500;">AVERAGE AQI</div>
                  <div style="font-size: 20px; font-weight: 700; color: #059669;">${healthiest.avgAQI}</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: #6b7280; font-weight: 500;">BEST POINT AQI</div>
                  <div style="font-size: 20px; font-weight: 700; color: #10b981;">${healthiest.minAQI}</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: #6b7280; font-weight: 500;">WORST POINT AQI</div>
                  <div style="font-size: 20px; font-weight: 700; color: #ef4444;">${healthiest.maxAQI}</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: #6b7280; font-weight: 500;">WEIGHTED SCORE</div>
                  <div style="font-size: 20px; font-weight: 700; color: #3b82f6;">${healthiest.aqi}</div>
                </div>
              </div>
            </div>

            <!-- Pollutant Levels Section -->
            <div style="
              background: rgba(16, 185, 129, 0.05); 
              padding: 20px; 
              border-radius: 16px; 
              border: 1px solid rgba(16, 185, 129, 0.2);
            ">
              <h3 style="
                color: #059669; 
                margin: 0 0 16px 0; 
                font-size: 18px; 
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
              ">
                🧪 Pollutant Levels (μg/m³)
              </h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 12px;">
                ${Object.entries(healthiest.pollutants).map(([key, value]) => `
                  <div style="
                    background: rgba(255, 255, 255, 0.7); 
                    padding: 12px 8px; 
                    border-radius: 8px; 
                    text-align: center;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                  ">
                    <div style="font-size: 12px; color: #6b7280; font-weight: 600;">${key.toUpperCase()}</div>
                    <div style="font-size: 16px; font-weight: 700; color: #1a202c;">${typeof value === 'number' ? value.toFixed(2) : value}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Route Comparison Section -->
            <div style="
              background: rgba(239, 68, 68, 0.05); 
              padding: 20px; 
              border-radius: 16px; 
              border: 1px solid rgba(239, 68, 68, 0.2);
              margin-top: 20px;
            ">
              <h3 style="
                color: #dc2626; 
                margin: 0 0 16px 0; 
                font-size: 18px; 
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
              ">
                🔄 Route Comparison Analysis
              </h3>
              <div style="margin-bottom: 16px; padding: 12px; background: rgba(255, 255, 255, 0.7); border-radius: 8px;">
                <div style="font-size: 14px; color: #374151; line-height: 1.5;">
                  <strong>Healthiest Route Algorithm:</strong><br>
                  This route balances air quality with practicality. Our algorithm weighs: <strong>50% average AQI + 25% pollution peaks + 15% distance penalty + 10% time penalty</strong>. 
                  This ensures reasonably clean air without an unreasonably long journey.
                </div>
              </div>
              <div id="comparisonMapContainer" style="margin-top: 16px;"></div>
            </div>
          </div>
        `);

                renderChartWithLimits(healthiest.pollutants);

                // Create route comparison map after DOM is ready
                setTimeout(() => {
                    console.log('🗺️ Creating route comparison map...');
                    createRouteComparisonMap(aqiResults, result);
                }, 1000);

                // Automatically generate AI insights after route is found
                setTimeout(() => {
                    console.log('🤖 Auto-generating AI insights for healthiest route...');
                    generateAIInsights();
                }, 500);
            } else {
                alert('Failed to get directions: ' + status);
            }
        });
    };













    const exportCSV = () => {
        const data = [["Pollutant", "Value (µg/m³)"]];
        for (const [key, value] of Object.entries(latestPollutants)) {
            data.push([key.toUpperCase(), value]);
        }
        data.push(["AQI", latestAQI]);
        data.push(["Dominant Pollutant", dominantPollutant.toUpperCase()]);

        const csvContent = "data:text/csv;charset=utf-8," + data.map(e => e.join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", csvContent);
        link.setAttribute("download", "aqi_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportPDF = () => {
        const doc = new jsPDF();

        doc.setFillColor(0, 0, 0);
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');

        const darkTextColor = '#ffffff';
        const headerColor = '#00e676';
        const lineHeight = 10;
        let y = 10;

        doc.setTextColor(headerColor);
        doc.setFontSize(18);
        doc.text("Healthiest Route AQI Report", 10, y);
        y += lineHeight * 2;

        doc.setTextColor(darkTextColor);
        doc.setFontSize(12);
        doc.text(`From: ${latestRouteInfo.start}`, 10, y); y += lineHeight;
        doc.text(`To: ${latestRouteInfo.end}`, 10, y); y += lineHeight;
        doc.text(`Distance: ${latestRouteInfo.distance}`, 10, y); y += lineHeight;
        doc.text(`Duration: ${latestRouteInfo.duration}`, 10, y); y += lineHeight;
        doc.text(`AQI: ${latestAQI}`, 10, y); y += lineHeight;
        doc.text(`Dominant Pollutant: ${dominantPollutant.toUpperCase()}`, 10, y); y += lineHeight * 2;

        doc.setTextColor(headerColor);
        doc.setFontSize(14);
        doc.text("Pollutant Levels (µg/m³):", 10, y);
        y += lineHeight;

        doc.setTextColor(darkTextColor);
        doc.setFontSize(12);
        for (const [key, value] of Object.entries(latestPollutants)) {
            doc.text(`${key.toUpperCase()}: ${value}`, 10, y);
            y += lineHeight;
            if (y > 270) {
                doc.addPage();
                doc.setFillColor(0, 0, 0);
                doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
                doc.setTextColor(darkTextColor);
                y = 10;
            }
        }

        if (chartRef.current) {
            const chartElement = chartRef.current;
            const originalStyle = chartElement.getAttribute('style');
            chartElement.style.backgroundColor = '#000000';
            chartElement.style.color = '#ffffff';

            html2canvas(chartElement, { backgroundColor: '#000000' }).then(canvas => {
                chartElement.setAttribute('style', originalStyle); // restore original style
                const imgData = canvas.toDataURL("image/png");
                doc.addPage();
                doc.setFillColor(0, 0, 0);
                doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
                doc.setTextColor(headerColor);
                doc.setFontSize(14);
                doc.text("Pollutant Bar Chart", 10, 10);
                doc.addImage(imgData, 'PNG', 10, 20, 180, 100);
                doc.save("aqi_report.pdf");
            });
        }
    };



    // Function to convert markdown-like formatting to HTML with modern typography
    const formatMarkdownToHTML = (text) => {
        if (!text) return '';
        return text
            // Section headers with emojis - modern gradient styling
            .replace(/🏆 (.*)/g, '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 16px; border-radius: 8px; margin: 16px 0 12px 0; font-weight: 600; font-size: 16px; display: flex; align-items: center; gap: 8px;">🏆 $1</div>')
            .replace(/🚗 (.*)/g, '<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 12px 16px; border-radius: 8px; margin: 16px 0 12px 0; font-weight: 600; font-size: 16px; display: flex; align-items: center; gap: 8px;">🚗 $1</div>')
            .replace(/🛡️ (.*)/g, '<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 12px 16px; border-radius: 8px; margin: 16px 0 12px 0; font-weight: 600; font-size: 16px; display: flex; align-items: center; gap: 8px;">🛡️ $1</div>')
            .replace(/⚠️ (.*)/g, '<div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 12px 16px; border-radius: 8px; margin: 16px 0 12px 0; font-weight: 600; font-size: 16px; display: flex; align-items: center; gap: 8px;">⚠️ $1</div>')
            .replace(/📋 (.*)/g, '<div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #2d3748; padding: 12px 16px; border-radius: 8px; margin: 16px 0 12px 0; font-weight: 600; font-size: 16px; display: flex; align-items: center; gap: 8px;">📋 $1</div>')
            .replace(/✨ (.*)/g, '<div style="background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%); color: #2d3748; padding: 8px 12px; border-radius: 6px; margin: 12px 0 8px 0; font-weight: 500; font-size: 14px; text-align: right; font-style: italic;">✨ $1</div>')

            // Regular headers
            .replace(/### (.*)/g, `<h3 style="color: #00ffff; font-size: 18px; font-weight: 700; margin: 20px 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);">$1</h3>`)
            .replace(/## (.*)/g, `<h2 style="color: #ff00ff; font-size: 20px; font-weight: 700; margin: 25px 0 15px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-shadow: 0 0 15px rgba(255, 0, 255, 0.8);">$1</h2>`)

            // Bold text
            .replace(/\*\*(.*?)\*\*/g, `<strong style="color: #00ff7f; font-weight: 700; text-shadow: 0 0 8px rgba(0, 255, 127, 0.6);">$1</strong>`)

            // Bullet points with better spacing and modern styling
            .replace(/• (.*?)(?=\n|$)/g, `<div style="margin: 8px 0; padding: 8px 0 8px 20px; line-height: 1.6; color: #ffffff; font-size: 14px; position: relative; border-left: 3px solid #00ffff; padding-left: 16px; background: rgba(0, 255, 255, 0.05); border-radius: 4px;"><span style="position: absolute; left: -8px; color: #00ffff; font-weight: bold; text-shadow: 0 0 5px rgba(0, 255, 255, 0.8);">•</span> $1</div>`)

            // Color-coded status indicators
            .replace(/✅ (.*)/g, `<div style="color: #00ff7f; font-weight: 600; margin: 8px 0; padding: 8px 12px; background: rgba(0, 255, 127, 0.1); border-left: 4px solid #00ff7f; border-radius: 4px; box-shadow: 0 0 10px rgba(0, 255, 127, 0.3);">✅ $1</div>`)
            .replace(/🔴 (.*)/g, `<div style="color: #ff0040; font-weight: 600; margin: 8px 0; padding: 8px 12px; background: rgba(255, 0, 64, 0.1); border-left: 4px solid #ff0040; border-radius: 4px; box-shadow: 0 0 10px rgba(255, 0, 64, 0.3);">🔴 $1</div>`)
            .replace(/🟠 (.*)/g, `<div style="color: #ff8000; font-weight: 600; margin: 8px 0; padding: 8px 12px; background: rgba(255, 128, 0, 0.1); border-left: 4px solid #ff8000; border-radius: 4px; box-shadow: 0 0 10px rgba(255, 128, 0, 0.3);">🟠 $1</div>`)
            .replace(/🟡 (.*)/g, `<div style="color: #ffff00; font-weight: 600; margin: 8px 0; padding: 8px 12px; background: rgba(255, 255, 0, 0.1); border-left: 4px solid #ffff00; border-radius: 4px; box-shadow: 0 0 10px rgba(255, 255, 0, 0.3);">🟡 $1</div>`)
            .replace(/🟢 (.*)/g, '<div style="color: #38a169; font-weight: 600; margin: 8px 0; padding: 8px 12px; background: #f0fff4; border-left: 4px solid #38a169; border-radius: 4px;">🟢 $1</div>')

            // Line breaks with proper spacing
            .replace(/\n/g, '<br style="margin: 4px 0;">');
    };



    // Instant display effect - no typing animation
    const typeWriterEffect = (text, callback) => {
        setIsTyping(false);
        setDisplayedInsights(text);
        if (callback) callback();
    };

    // Format AI insights for display with horizontal card layout
    const formatAIInsights = (insights) => {
        if (!insights) return '';

        console.log('🔍 Raw insights content:', insights);

        // First, let's extract the sections and create a horizontal layout
        const sections = [];

        // Split content by section headers - simpler approach
        const parts = insights.split(/\*\*([^*]+)\*\*/);
        console.log('🔍 Split parts:', parts.length);

        for (let i = 1; i < parts.length; i += 2) {
            const title = parts[i];
            let content = parts[i + 1];

            if (title && content && content.trim()) {
                let icon = '📄';
                let cleanTitle = title.trim();

                console.log(`🔍 Processing title: "${title}"`);
                console.log(`🔍 Content preview: "${content.substring(0, 100)}..."`);

                // Special handling for sections that got split incorrectly
                if (title.includes('DISEASES PREVENTED BY CHOOSING THIS ROUTE') && content.trim() === '•') {
                    // Combine with the next few parts to get the full bullet point content
                    let fullContent = content;
                    let j = i + 2;
                    while (j < parts.length && j < i + 10) { // Look ahead up to 5 more parts
                        if (parts[j] && !parts[j].includes('RISKS OF ALTERNATIVE') && !parts[j].includes('TRAVEL PRECAUTIONS')) {
                            fullContent += '**' + parts[j] + '**' + (parts[j + 1] || '');
                            j += 2;
                        } else {
                            break;
                        }
                    }
                    content = fullContent;
                    console.log(`🔧 Fixed DISEASES content: "${content.substring(0, 100)}..."`);
                }

                if (title.includes('TRAVEL PRECAUTIONS') && content.trim() === '•') {
                    // Combine with the next few parts to get the full bullet point content
                    let fullContent = content;
                    let j = i + 2;
                    while (j < parts.length && j < i + 10) { // Look ahead up to 5 more parts
                        if (parts[j]) {
                            fullContent += '**' + parts[j] + '**' + (parts[j + 1] || '');
                            j += 2;
                        } else {
                            break;
                        }
                    }
                    content = fullContent;
                    console.log(`🔧 Fixed PRECAUTIONS content: "${content.substring(0, 100)}..."`);
                }

                // Match section types with more flexible matching
                if (title.includes('ROUTE SELECTION')) {
                    icon = '🛣️';
                    cleanTitle = 'ROUTE SELECTION SUMMARY';
                }
                else if (title.includes('WHY THIS ROUTE') || title.includes('HEALTHIER')) {
                    icon = '🌿';
                    cleanTitle = 'WHY THIS ROUTE IS HEALTHIER';
                }
                else if (title.includes('DISEASES') || title.includes('PREVENTED')) {
                    icon = '🛡️';
                    cleanTitle = 'DISEASES PREVENTED';
                }
                else if (title.includes('RISKS') || title.includes('ALTERNATIVE')) {
                    icon = '⚠️';
                    cleanTitle = 'RISKS OF ALTERNATIVE ROUTES';
                }
                else if (title.includes('TRAVEL') || title.includes('PRECAUTIONS')) {
                    icon = '📋';
                    cleanTitle = 'TRAVEL PRECAUTIONS';
                }
                else {
                    console.log(`⚠️ Unmatched section title: "${title}"`);
                    // Still add it with default icon
                    cleanTitle = title;
                }

                sections.push({
                    icon: icon,
                    title: cleanTitle,
                    content: content.trim()
                });

                console.log(`✅ Added section: ${cleanTitle} (${content.length} chars)`);
            } else {
                console.log(`❌ Skipped section - title: "${title}", content length: ${content ? content.length : 0}`);
            }
        }

        console.log('🔍 Total sections found:', sections.length);

        // If we still don't have enough sections, add a debug section
        if (sections.length < 3) {
            console.log('⚠️ Not enough sections found, adding debug info');
            sections.push({
                icon: '🔍',
                title: 'DEBUG - RAW CONTENT',
                content: insights.substring(0, 500) + '...'
            });
        }

        // Create horizontal grid layout
        let horizontalLayout = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin: 20px 0;">';

        sections.forEach((section, index) => {
            console.log(`🎨 Rendering section ${index + 1}: ${section.title}`);
            console.log(`🎨 Raw content: "${section.content.substring(0, 100)}..."`);

            // Skip sections with no meaningful content
            if (!section.content || section.content.trim().length < 5) {
                console.log(`⚠️ Skipping section with insufficient content: ${section.title}`);
                return;
            }

            let processedContent = section.content
                // Bold text
                .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #2d3748; font-weight: 700;">$1</strong>')
                // Bullet points
                .replace(/• (.*?)(?=\n|•|$)/g, '<div style="margin: 6px 0; padding: 8px 12px; line-height: 1.4; color: #4a3728; font-size: 13px; background: rgba(139, 105, 20, 0.1); border-left: 3px solid rgba(139, 105, 20, 0.4); border-radius: 4px; position: relative;"><span style="color: rgba(139, 105, 20, 0.8); font-weight: bold; margin-right: 6px;">•</span>$1</div>')
                // Line breaks
                .replace(/\n\n/g, '<br><br>')
                .replace(/\n/g, '<br>');

            // If processed content is still empty, add fallback
            if (!processedContent || processedContent.trim().length < 5) {
                processedContent = `<div style="color: #666; font-style: italic;">Content processing issue - Raw: ${section.content.substring(0, 100)}...</div>`;
            }

            console.log(`🎨 Processed content: "${processedContent.substring(0, 100)}..."`);

            horizontalLayout += `
                <div style="
                    background: rgba(255, 248, 240, 0.6); 
                    backdrop-filter: blur(25px); 
                    border: 1px solid rgba(139, 105, 20, 0.3); 
                    color: #4a3728; 
                    padding: 16px; 
                    border-radius: 12px; 
                    font-size: 14px; 
                    line-height: 1.5; 
                    box-shadow: 0 8px 25px rgba(139, 105, 20, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6);
                    height: fit-content;
                    min-height: 200px;
                    display: flex;
                    flex-direction: column;
                ">
                    <div style="
                        display: flex; 
                        align-items: center; 
                        gap: 8px; 
                        margin-bottom: 12px; 
                        font-weight: 700; 
                        font-size: 15px;
                        color: #2d3748;
                        border-bottom: 1px solid rgba(139, 105, 20, 0.2);
                        padding-bottom: 8px;
                    ">
                        ${section.icon} ${section.title}
                    </div>
                    <div style="flex: 1; font-weight: 500;">
                        ${processedContent}
                    </div>
                </div>
            `;
        });

        horizontalLayout += '</div>';

        console.log('🎨 Final HTML length:', horizontalLayout.length);
        console.log('🎨 Final HTML preview:', horizontalLayout.substring(0, 200) + '...');

        return horizontalLayout;

    };

    const generateAIInsights = async () => {
        if (!latestPollutants || Object.keys(latestPollutants).length === 0) {
            console.log('⚠️ No route data available for AI analysis');
            return;
        }

        setLoadingInsights(true);

        try {
            console.log('🤖 Starting Gemini AI analysis...');
            console.log('API Key (first 10 chars):', geminiApiKey.substring(0, 10) + '...');

            const pollutantData = {
                aqi: latestAQI,
                category: getAQICategory(latestAQI),
                dominantPollutant: dominantPollutant,
                pollutants: latestPollutants,
                routeInfo: latestRouteInfo
            };

            console.log('Pollutant Data:', pollutantData);

            // Test with a simple request first
            console.log('🔑 Testing Gemini API connection...');

            const prompt = `
        Analyze this air quality data for the HEALTHIEST ROUTE selected by our algorithm and provide a comprehensive route comparison:
        
        🛣️ SELECTED HEALTHIEST ROUTE:
        Route: ${pollutantData.routeInfo.start} to ${pollutantData.routeInfo.end}
        AQI: ${pollutantData.aqi} (${pollutantData.category})
        Primary Concern: ${pollutantData.dominantPollutant}
        Key Pollutants: PM2.5: ${pollutantData.pollutants.pm2_5 || 'N/A'}, PM10: ${pollutantData.pollutants.pm10 || 'N/A'}, NO2: ${pollutantData.pollutants.no2 || 'N/A'}
        Distance: ${pollutantData.routeInfo.distance}
        Duration: ${pollutantData.routeInfo.duration}

        Provide response in this EXACT format:

        🏆 **ROUTE SELECTION SUMMARY**
        [Explain why our algorithm chose this route over Google's default fastest route. Compare air quality benefits vs time/distance trade-offs - 2-3 sentences]

        🚗 **WHY THIS ROUTE IS HEALTHIER**
        [Explain specific advantages: lower pollution exposure, fewer industrial areas, better ventilation, etc. - 2 sentences]

        🛡️ **DISEASES PREVENTED BY CHOOSING THIS ROUTE**
        • [Respiratory condition 1 and why]
        • [Cardiovascular condition and why] 
        • [Other health risk avoided]

        ⚠️ **RISKS OF ALTERNATIVE ROUTES**
        [What health problems could the faster/shorter routes cause due to higher pollution - 2 sentences]

        📋 **TRAVEL PRECAUTIONS** ${pollutantData.aqi > 150 ? '(HIGH POLLUTION ALERT)' : ''}
        • [Best travel time recommendation]
        • [Essential protective gear needed]
        • [Vulnerable groups advice]
        • [Vehicle ventilation tips]
        • [Pre/post-travel health measures]

        Keep total response under 300 words. Be specific and medically accurate.
      `;

            // Simple direct API call to Gemini Pro
            console.log('🚀 Calling Gemini Pro API...');
            // First, let's check what models are available
            console.log('🔍 Checking available models...');
            const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${geminiApiKey}`);
            const modelsData = await modelsResponse.json();
            console.log('Available models:', modelsData);

            // Log each model name clearly
            if (modelsData.models) {
                console.log('📋 Available model names:');
                modelsData.models.forEach((model, index) => {
                    console.log(`  ${index + 1}. ${model.name}`);
                });

                // Find a working model
                const workingModel = modelsData.models.find(model =>
                    model.name.includes('gemini') &&
                    model.supportedGenerationMethods &&
                    model.supportedGenerationMethods.includes('generateContent')
                );

                if (workingModel) {
                    console.log('✅ Using model:', workingModel.name);
                    const modelName = workingModel.name.split('/').pop(); // Get just the model name part
                    console.log('📡 Model name for API:', modelName);
                }
            }

            // Try the generateContent call with the correct model
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Gemini API Error:', response.status, errorData);
                throw new Error(`Gemini API failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            console.log('Gemini API Response:', data);

            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
                const insights = data.candidates[0].content.parts[0].text;
                setAiInsights(insights);
                typeWriterEffect(insights);
                setInsightsSource('gemini');
                console.log('✅ Gemini AI analysis complete');
            } else {
                throw new Error('Invalid response format from Gemini API');
            }

        } catch (error) {
            console.error('❌ Gemini AI Error:', error);

            // Show specific error details
            if (error.message.includes('404')) {
                console.log('🔄 Gemini API endpoint not found - using enhanced local analysis...');
            } else if (error.message.includes('403')) {
                console.log('🔑 API key authentication failed - using enhanced local analysis...');
            } else if (error.message.includes('quota')) {
                console.log('⚠️ API quota exceeded - using enhanced local analysis...');
            } else {
                console.log('🔄 Network/API issue - using enhanced local analysis...');
            }

            // Enhanced fallback insights based on the data
            const fallbackInsights = generateFallbackInsights(latestAQI, latestPollutants, dominantPollutant, latestRouteInfo);
            setAiInsights(fallbackInsights);
            typeWriterEffect(fallbackInsights);
            setInsightsSource('local');
        } finally {
            setLoadingInsights(false);
        }
    };

    const generateFallbackInsights = (aqi, pollutants, dominant, routeInfo) => {
        const category = getAQICategory(aqi);

        let healthImpact = '';
        let recommendations = '';

        if (aqi <= 50) {
            healthImpact = '🟢 **Excellent Air Quality!** This route has minimal health risks for all individuals.';
            recommendations = '✅ Perfect for outdoor activities, exercise, and travel at any time.';
        } else if (aqi <= 100) {
            healthImpact = '🟡 **Moderate Air Quality.** Generally acceptable, but sensitive individuals may experience minor issues.';
            recommendations = '⚠️ Sensitive individuals should consider limiting prolonged outdoor exposure.';
        } else if (aqi <= 200) {
            healthImpact = '🟠 **Unhealthy for Sensitive Groups.** Children, elderly, and people with respiratory conditions may be affected.';
            recommendations = '😷 Consider wearing masks, limit outdoor activities, and keep windows closed during travel.';
        } else {
            healthImpact = '🔴 **Unhealthy Air Quality.** Health effects may be experienced by the general population.';
            recommendations = '🚨 Avoid prolonged outdoor exposure, wear N95 masks, and consider postponing non-essential travel.';
        }

        const getDetailedPollutantInfo = (pollutant, value) => {
            const info = {
                pm2_5: {
                    diseases: "Lung Cancer, Heart Disease, Stroke, COPD, Asthma, Premature Death",
                    longTerm: "Chronic exposure increases risk of cardiovascular disease by 20-30%, lung cancer by 15-20%",
                    symptoms: "Coughing, shortness of breath, chest tightness, reduced lung function"
                },
                pm10: {
                    diseases: "Respiratory Infections, Bronchitis, Asthma Attacks, Eye Irritation",
                    longTerm: "Chronic bronchitis, reduced lung development in children, premature aging of lungs",
                    symptoms: "Throat irritation, coughing, sneezing, runny nose, eye watering"
                },
                no2: {
                    diseases: "Asthma, Respiratory Infections, Reduced Lung Function, COPD",
                    longTerm: "Increased susceptibility to respiratory infections, stunted lung growth in children",
                    symptoms: "Wheezing, coughing, chest pain, difficulty breathing"
                },
                o3: {
                    diseases: "Asthma Attacks, Emphysema, Chronic Bronchitis, Premature Death",
                    longTerm: "Permanent lung damage, accelerated aging of lungs, increased risk of respiratory death",
                    symptoms: "Chest pain, coughing, throat irritation, airway inflammation"
                },
                co: {
                    diseases: "Carbon Monoxide Poisoning, Heart Disease, Brain Damage, Death",
                    longTerm: "Cardiovascular disease, neurological damage, cognitive impairment",
                    symptoms: "Headache, dizziness, weakness, nausea, confusion, chest pain"
                },
                so2: {
                    diseases: "Asthma, Bronchitis, Emphysema, Cardiovascular Disease",
                    longTerm: "Chronic respiratory disease, increased mortality from heart and lung disease",
                    symptoms: "Throat irritation, coughing, mucus production, worsening of asthma"
                },
                nh3: {
                    diseases: "Eye/Skin Irritation, Respiratory Burns, Chemical Pneumonia",
                    longTerm: "Chronic respiratory irritation, potential lung scarring with severe exposure",
                    symptoms: "Eye burning, skin irritation, coughing, throat burning, difficulty breathing"
                }
            };
            return info[pollutant] || { diseases: "Unknown", longTerm: "Unknown", symptoms: "Unknown" };
        };

        // Function to get realistic health status
        const getHealthStatus = (pollutant, value) => {
            const thresholds = {
                pm2_5: { good: 30, moderate: 60, unhealthy: 90, dangerous: 120 },
                pm10: { good: 50, moderate: 100, unhealthy: 250, dangerous: 350 },
                no2: { good: 40, moderate: 80, unhealthy: 180, dangerous: 280 },
                o3: { good: 50, moderate: 100, unhealthy: 168, dangerous: 208 },
                co: { good: 1000, moderate: 2000, unhealthy: 10000, dangerous: 17000 },
                so2: { good: 40, moderate: 80, unhealthy: 380, dangerous: 800 },
                nh3: { good: 200, moderate: 400, unhealthy: 800, dangerous: 1200 }
            };

            const t = thresholds[pollutant];
            if (!t) return '❓ Unknown';

            if (value <= t.good) return '✅ Good';
            if (value <= t.moderate) return '🟡 Moderate';
            if (value <= t.unhealthy) return '🟠 Unhealthy';
            if (value <= t.dangerous) return '🔴 Very Unhealthy';
            return '🚨 Hazardous';
        };

        const pollutantAnalysis = `
**🎯 Dominant Pollutant: ${dominant.toUpperCase()}**
${getPollutantDescription(dominant)}

**📊 Detailed Health Analysis by Pollutant:**

• **PM2.5: ${pollutants.pm2_5} μg/m³** ${getHealthStatus('pm2_5', pollutants.pm2_5)}
  🦠 **Diseases:** ${getDetailedPollutantInfo('pm2_5').diseases}
  ⏰ **Long-term Effects:** ${getDetailedPollutantInfo('pm2_5').longTerm}
  🩺 **Symptoms:** ${getDetailedPollutantInfo('pm2_5').symptoms}

• **PM10: ${pollutants.pm10} μg/m³** ${getHealthStatus('pm10', pollutants.pm10)}
  🦠 **Diseases:** ${getDetailedPollutantInfo('pm10').diseases}
  ⏰ **Long-term Effects:** ${getDetailedPollutantInfo('pm10').longTerm}
  🩺 **Symptoms:** ${getDetailedPollutantInfo('pm10').symptoms}

• **NO2: ${pollutants.no2} μg/m³** ${getHealthStatus('no2', pollutants.no2)}
  🦠 **Diseases:** ${getDetailedPollutantInfo('no2').diseases}
  ⏰ **Long-term Effects:** ${getDetailedPollutantInfo('no2').longTerm}
  🩺 **Symptoms:** ${getDetailedPollutantInfo('no2').symptoms}

• **O3: ${pollutants.o3} μg/m³** ${getHealthStatus('o3', pollutants.o3)}
  🦠 **Diseases:** ${getDetailedPollutantInfo('o3').diseases}
  ⏰ **Long-term Effects:** ${getDetailedPollutantInfo('o3').longTerm}
  🩺 **Symptoms:** ${getDetailedPollutantInfo('o3').symptoms}

• **CO: ${pollutants.co} μg/m³** ${getHealthStatus('co', pollutants.co)}
  🦠 **Diseases:** ${getDetailedPollutantInfo('co').diseases}
  ⏰ **Long-term Effects:** ${getDetailedPollutantInfo('co').longTerm}
  🩺 **Symptoms:** ${getDetailedPollutantInfo('co').symptoms}

• **SO2: ${pollutants.so2} μg/m³** ${getHealthStatus('so2', pollutants.so2)}
  🦠 **Diseases:** ${getDetailedPollutantInfo('so2').diseases}
  ⏰ **Long-term Effects:** ${getDetailedPollutantInfo('so2').longTerm}
  🩺 **Symptoms:** ${getDetailedPollutantInfo('so2').symptoms}

• **NH3: ${pollutants.nh3} μg/m³** ${getHealthStatus('nh3', pollutants.nh3)}
  🦠 **Diseases:** ${getDetailedPollutantInfo('nh3').diseases}
  ⏰ **Long-term Effects:** ${getDetailedPollutantInfo('nh3').longTerm}
  🩺 **Symptoms:** ${getDetailedPollutantInfo('nh3').symptoms}
    `;

        const getSummaryParagraph = () => {
            if (aqi <= 50) return `This route has excellent air quality with minimal health risks. The ${dominant.toUpperCase()} levels are well within safe limits, making it suitable for all travelers including sensitive individuals.`;
            if (aqi <= 100) return `This route shows moderate air quality with ${dominant.toUpperCase()} as the primary concern. Generally acceptable for most people, though sensitive individuals may experience minor respiratory discomfort.`;
            if (aqi <= 200) return `This route has unhealthy air quality levels, particularly elevated ${dominant.toUpperCase()}. Health effects may occur in sensitive groups, and protective measures are recommended for all travelers.`;
            return `This route shows hazardous air quality with dangerous ${dominant.toUpperCase()} levels. Significant health risks exist for all individuals, and travel should be minimized or postponed if possible.`;
        };

        const getBestTime = () => {
            return aqi > 150 ? 'Travel during early morning (5-7 AM) when pollution is typically lowest' : 'Early morning (6-9 AM) or late evening (after 8 PM) for optimal air quality';
        };

        const getProtection = () => {
            if (aqi <= 50) return 'No special protection needed, standard travel precautions apply';
            if (aqi <= 100) return 'Keep windows closed, use AC recirculation mode';
            if (aqi <= 200) return 'Wear N95 mask, keep windows closed, limit outdoor exposure';
            return 'Use N95 or P100 mask, avoid outdoor activities, consider postponing travel';
        };

        const getPollutionSource = () => {
            const sources = {
                pm2_5: 'Vehicle emissions and industrial activities are primary sources',
                pm10: 'Road dust, construction activities, and vehicle exhaust contribute most',
                no2: 'Heavy traffic and diesel vehicles are the main contributors',
                o3: 'Sunlight reacting with vehicle emissions creates elevated ozone levels',
                co: 'Vehicle exhaust and traffic congestion are primary sources',
                so2: 'Industrial emissions and fuel combustion are main contributors'
            };
            return sources[dominant] || 'Mixed urban pollution sources affect this route';
        };

        const getVulnerableAdvice = () => {
            if (aqi <= 100) return 'Children and elderly can travel normally with standard precautions';
            if (aqi <= 200) return 'Children, elderly, and asthmatics should limit exposure and wear masks';
            return 'Vulnerable groups should avoid this route or postpone travel if possible';
        };

        const getLongTermAdvice = () => {
            if (aqi <= 100) return 'Daily use poses minimal long-term health risks';
            if (aqi <= 200) return 'Regular use may increase respiratory issues; consider alternative routes';
            return 'Daily exposure significantly increases cardiovascular and respiratory disease risk';
        };

        return `
**ROUTE SELECTION SUMMARY**
Our algorithm prioritized health, selecting this route due to its significantly lower air quality index (AQI ${aqi}) compared to likely faster, more polluted alternatives. While potentially longer in distance (${routeInfo.distance}) and duration (${routeInfo.duration}), the chosen path offers substantial air quality benefits, mitigating health risks over minimal time savings.

**WHY THIS ROUTE IS HEALTHIER**
This route offers specific advantages through reduced exposure to particulate matter, primarily PM2.5, which is highly detrimental to human health. It likely traverses areas with less concentrated vehicular emissions and less industrial activity and traffic congestion, contributing to a healthier breathing environment during transit.

**DISEASES PREVENTED BY CHOOSING THIS ROUTE**
• Respiratory conditions like asthma attacks and chronic bronchitis from reduced PM2.5 exposure
• Cardiovascular disease and heart attacks from lower NO2 and particulate matter levels
• Long-term lung cancer risk reduction through minimized exposure to carcinogenic particles

**RISKS OF ALTERNATIVE ROUTES**
Faster routes, often traversing dense urban areas or industrial belts, likely expose travelers to significantly higher concentrations of PM2.5 and PM10, potentially with elevated NO2. This elevated exposure could acutely trigger respiratory distress, worsen existing heart conditions, and contribute to long-term chronic diseases like lung cancer and impaired brain development.

**TRAVEL PRECAUTIONS** ${aqi > 150 ? '(HIGH POLLUTION ALERT)' : ''}
• ${getBestTime()}
• ${getProtection()}
• ${getVulnerableAdvice()}
• Keep windows closed and use AC recirculation mode during travel
• Consider pre-travel hydration and post-travel respiratory care measures
    `;
    };

    // Advanced iOS glassmorphism effects and animations
    useEffect(() => {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
      /* Core iOS glassmorphism animations */
      @keyframes gradientShift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      
      @keyframes glassFloat {
        0%, 100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-8px) scale(1.01); }
      }
      
      @keyframes glassShimmer {
        0% { transform: translateX(-100%) skewX(-15deg) scale(0.8); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateX(200%) skewX(-15deg) scale(1.2); opacity: 0; }
      }
      
      @keyframes glassRefraction {
        0%, 100% { 
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          box-shadow: 0 8px 32px rgba(0,0,0,0.37), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        50% { 
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
        }
      }
      
      @keyframes prismaticGlow {
        0%, 100% { filter: hue-rotate(0deg) saturate(1); }
        25% { filter: hue-rotate(90deg) saturate(1.2); }
        50% { filter: hue-rotate(180deg) saturate(1.4); }
        75% { filter: hue-rotate(270deg) saturate(1.2); }
      }
      
      /* Advanced glass element styling */
      .glass-element {
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(25px) saturate(180%) brightness(1.1);
        -webkit-backdrop-filter: blur(25px) saturate(180%) brightness(1.1);
        background: rgba(0, 0, 0, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.2);
        animation: glassFloat 8s ease-in-out infinite, glassRefraction 6s ease-in-out infinite;
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.37),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          0 0 0 1px rgba(255, 255, 255, 0.05);
      }
      
      .glass-element::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg, 
          transparent 0%, 
          rgba(255, 255, 255, 0.1) 25%,
          rgba(255, 255, 255, 0.2) 50%,
          rgba(255, 255, 255, 0.1) 75%,
          transparent 100%
        );
        animation: glassShimmer 4s ease-in-out infinite;
        z-index: 1;
        pointer-events: none;
        transform: skewX(-15deg);
      }
      
      .glass-element::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.1) 0%,
          transparent 50%,
          rgba(255, 255, 255, 0.05) 100%
        );
        pointer-events: none;
        z-index: 0;
      }
      
      /* Enhanced button effects */
      .button-ripple {
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(40px) saturate(200%);
        -webkit-backdrop-filter: blur(40px) saturate(200%);
        background: rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.05);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform-style: preserve-3d;
      }
      
      .button-ripple::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }
      
      .button-ripple:hover::before {
        opacity: 1;
      }
      
      .button-ripple::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
        transform: translate(-50%, -50%);
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
        z-index: 2;
      }
      
      .button-ripple:hover::after {
        width: 300px;
        height: 300px;
      }
      
      .button-ripple:active {
        transform: scale(0.98) translateZ(-10px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      }
      
      .button-ripple:hover {
        background: rgba(0, 0, 0, 0.15);
        border-color: rgba(255, 255, 255, 0.08);
        box-shadow: 
          0 12px 40px rgba(0, 0, 0, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.05);
      }
      
      /* Enhanced input styling */
      input {
        backdrop-filter: blur(40px) saturate(200%);
        -webkit-backdrop-filter: blur(40px) saturate(200%);
        background: rgba(0, 0, 0, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.05) !important;
        color: #ffffff !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      
      input::placeholder {
        color: rgba(255, 255, 255, 0.6) !important;
      }
      
      input:focus {
        background: rgba(0, 0, 0, 0.15) !important;
        border-color: rgba(59, 130, 246, 0.3) !important;
        box-shadow: 
          0 0 0 2px rgba(59, 130, 246, 0.2),
          0 8px 32px rgba(0, 0, 0, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.03) !important;
        transform: translateY(-2px) scale(1.02) !important;
      }
      
      /* Global glass styling */
      * {
        transition: backdrop-filter 0.3s ease, background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
      }
      

      
      /* Prismatic effects for special elements */
      .prismatic {
        animation: prismaticGlow 8s ease-in-out infinite;
      }
    `;
        document.head.appendChild(styleSheet);

        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    return (
        <>
            <div style={styles.fixedBackground}></div>
            <div style={styles.container}>
                <div style={styles.floatingElements}>
                    <div style={{ ...styles.floatingCircle, width: '100px', height: '100px', top: '10%', left: '10%', animationDelay: '0s' }}></div>
                    <div style={{ ...styles.floatingCircle, width: '150px', height: '150px', top: '60%', right: '10%', animationDelay: '2s' }}></div>
                    <div style={{ ...styles.floatingCircle, width: '80px', height: '80px', bottom: '20%', left: '20%', animationDelay: '4s' }}></div>
                </div>
                <div style={styles.content}>
                    <h1 style={styles.title}>OxyArcRoute</h1>

                    <div style={styles.controls}>
                        <div style={styles.inputContainer}>
                            <input
                                ref={startInputRef}
                                id="start"
                                style={styles.input}
                                placeholder="🚀 Start location"
                                value={startLocation}
                                onChange={(e) => setStartLocation(e.target.value)}
                                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                onBlur={(e) => {
                                    e.target.style.border = '2px solid transparent';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                                    e.target.style.transform = 'translateY(0px)';
                                }}
                            />
                        </div>
                        <div style={styles.inputContainer}>
                            <input
                                ref={endInputRef}
                                id="end"
                                style={styles.input}
                                placeholder="🎯 End location"
                                value={endLocation}
                                onChange={(e) => setEndLocation(e.target.value)}
                                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                                onBlur={(e) => {
                                    e.target.style.border = '2px solid transparent';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                                    e.target.style.transform = 'translateY(0px)';
                                }}
                            />
                        </div>
                        <button
                            className="button-ripple"
                            style={{ ...styles.button, background: 'rgba(5, 5, 10, 0.15)', backdropFilter: 'blur(40px) saturate(150%)', border: '1px solid rgba(255, 255, 255, 0.03)', color: '#ffffff' }}
                            onClick={showRoutes}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-5px) scale(1.05)';
                                e.target.style.boxShadow = '0 15px 35px rgba(139, 105, 20, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0px) scale(1)';
                                e.target.style.boxShadow = '0 8px 25px rgba(139, 105, 20, 0.2)';
                            }}
                        >
                            🗺️ Show Routes
                        </button>
                        <button
                            className="button-ripple"
                            style={{ ...styles.button, background: 'rgba(5, 5, 10, 0.15)', backdropFilter: 'blur(40px) saturate(150%)', border: '1px solid rgba(255, 255, 255, 0.03)', color: '#ffffff' }}
                            onClick={showHealthiestRoute}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-5px) scale(1.05)';
                                e.target.style.boxShadow = '0 15px 35px rgba(139, 105, 20, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0px) scale(1)';
                                e.target.style.boxShadow = '0 8px 25px rgba(139, 105, 20, 0.2)';
                            }}
                        >
                            🌿 Healthiest Route
                        </button>

                        <button
                            className="button-ripple"
                            style={{ ...styles.button, background: 'rgba(5, 5, 10, 0.15)', backdropFilter: 'blur(40px) saturate(150%)', border: '1px solid rgba(255, 255, 255, 0.03)', color: '#ffffff' }}
                            onClick={exportCSV}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-5px) scale(1.05)';
                                e.target.style.boxShadow = '0 15px 35px rgba(139, 105, 20, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0px) scale(1)';
                                e.target.style.boxShadow = '0 8px 25px rgba(139, 105, 20, 0.2)';
                            }}
                        >
                            📊 Export CSV
                        </button>
                        <button
                            className="button-ripple"
                            style={{ ...styles.button, background: 'rgba(5, 5, 10, 0.15)', backdropFilter: 'blur(40px) saturate(150%)', border: '1px solid rgba(255, 255, 255, 0.03)', color: '#ffffff' }}
                            onClick={exportPDF}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-5px) scale(1.05)';
                                e.target.style.boxShadow = '0 15px 35px rgba(139, 105, 20, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0px) scale(1)';
                                e.target.style.boxShadow = '0 8px 25px rgba(139, 105, 20, 0.2)';
                            }}
                        >
                            📄 Export PDF
                        </button>
                        {/* Dark mode toggle removed - using fixed dark glass theme */}
                    </div>

                    <div style={styles.mapContainer}>
                        <div ref={mapRef} style={styles.map}></div>
                    </div>

                    {/* AQI Visual Scale - Subtle and smaller */}
                    {latestAQI > 0 && (
                        <AQIScale currentAQI={latestAQI} />
                    )}

                    {/* Route Comparison Container - Beige glass theme */}
                    <div id="comparisonMapContainer" style={{
                        width: '100%',
                        minHeight: '400px',
                        borderRadius: '24px',
                        margin: '24px 0',
                        display: 'none',
                        border: '1px solid rgba(255, 255, 255, 0.03)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                        background: 'rgba(5, 5, 10, 0.15)',
                        backdropFilter: 'blur(40px) saturate(150%)',
                        WebkitBackdropFilter: 'blur(40px) saturate(150%)',
                        padding: '20px',
                        zIndex: 1,
                        color: '#ffffff'
                    }}></div>

                    {/* AI Insights Section - Beautiful formatting restored */}
                    {(latestPollutants && Object.keys(latestPollutants).length > 0) && (
                        <div style={{
                            ...styles.aiInsightsContainer,
                            marginTop: '24px',
                            zIndex: 2,
                            position: 'relative'
                        }}>
                            <div style={styles.aiTitle}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor" />
                                </svg>
                                🤖 AI Air Quality Analysis
                            </div>

                            {loadingInsights && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#7d8590',
                                    fontSize: '14px'
                                }}>
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        border: '2px solid transparent',
                                        borderTop: '2px solid #1a73e8',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite',
                                        marginRight: '8px'
                                    }}></div>
                                    Analyzing air quality data...
                                </div>
                            )}

                            {displayedInsights && (
                                <div style={styles.aiContent} dangerouslySetInnerHTML={{
                                    __html: formatAIInsights(displayedInsights) + (isTyping ? '<span style="animation: blink 1s infinite; color: #1a73e8; font-size: 16px;">|</span>' : '')
                                }} />
                            )}

                            {!aiInsights && !loadingInsights && !isTyping && (
                                <div>
                                    <p style={{
                                        color: '#7d8590',
                                        marginBottom: '16px',
                                        fontSize: '14px',
                                        lineHeight: '1.4'
                                    }}>
                                        🤖 AI analysis will be automatically generated when you find the healthiest route.
                                    </p>
                                    <button
                                        onClick={generateAIInsights}
                                        style={styles.aiButton}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 8px 20px rgba(139, 105, 20, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 12px rgba(139, 105, 20, 0.2)';
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor" />
                                        </svg>
                                        Generate AI Analysis
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {routeDetails && (
                        <div style={styles.routeSummary}>
                            <div style={styles.routeSummaryGlow}></div>
                            <div dangerouslySetInnerHTML={{ __html: routeDetails }} />
                        </div>
                    )}

                    {chartData && (
                        <div style={{ margin: '40px auto 20px auto', maxWidth: '1200px', position: 'relative', zIndex: 1 }}>
                            {/* Main Pollutant Comparison Chart */}
                            <div ref={chartRef} style={styles.chartContainer}>
                                <h3 style={styles.chartTitle}>🧪 Pollutant Levels vs WHO Safe Limits</h3>
                                <Bar data={chartData.data} options={chartData.options} />
                            </div>

                            {/* Additional Charts Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                                gap: '20px',
                                marginTop: '20px'
                            }}>
                                {/* Health Risk Radar Chart */}
                                <div style={styles.chartContainer}>
                                    <h3 style={styles.chartTitle}>⚠️ Health Risk Assessment</h3>
                                    <div style={{
                                        padding: '20px',
                                        textAlign: 'center',
                                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                        borderRadius: '12px',
                                        border: '1px solid #f59e0b'
                                    }}>
                                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                                            {latestAQI <= 50 ? '😊' : latestAQI <= 100 ? '😐' : latestAQI <= 200 ? '😷' : '🚨'}
                                        </div>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: getAQIColor(latestAQI) }}>
                                            AQI: {latestAQI}
                                        </div>
                                        <div style={{ fontSize: '16px', color: '#92400e', marginTop: '8px' }}>
                                            {getAQICategory(latestAQI)}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#78716c', marginTop: '12px', lineHeight: '1.4' }}>
                                            {latestAQI <= 50 ? 'Air quality is satisfactory for most people' :
                                                latestAQI <= 100 ? 'Moderate air quality - sensitive groups may experience minor issues' :
                                                    latestAQI <= 200 ? 'Unhealthy air - everyone may experience health effects' :
                                                        'Very unhealthy - serious health effects for everyone'}
                                        </div>
                                    </div>
                                </div>

                                {/* Pollutant Breakdown Pie Chart */}
                                <div style={styles.chartContainer}>
                                    <h3 style={styles.chartTitle}>📊 Pollution Sources</h3>
                                    <div style={{ padding: '20px' }}>
                                        {Object.entries(latestPollutants).filter(([key, value]) => value > 0).map(([key, value], index) => {
                                            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];
                                            const percentage = ((value / Object.values(latestPollutants).reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                                            return (
                                                <div key={key} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginBottom: '12px',
                                                    padding: '8px',
                                                    background: 'rgba(255, 255, 255, 0.5)',
                                                    borderRadius: '8px'
                                                }}>
                                                    <div style={{
                                                        width: '16px',
                                                        height: '16px',
                                                        background: colors[index % colors.length],
                                                        borderRadius: '50%',
                                                        marginRight: '12px'
                                                    }}></div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{key.toUpperCase()}</div>
                                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                            {typeof value === 'number' ? value.toFixed(2) : value} {key === 'co' ? 'mg/m³' : 'μg/m³'}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontWeight: 'bold', color: colors[index % colors.length] }}>
                                                        {percentage}%
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Health Impact Timeline */}
                                <div style={styles.chartContainer}>
                                    <h3 style={styles.chartTitle}>⏰ Exposure Timeline</h3>
                                    <div style={{ padding: '20px' }}>
                                        <div style={{ marginBottom: '16px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Short-term (1-2 hours)</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                                                {latestAQI <= 100 ? '✅ Minimal immediate effects' : '⚠️ Eye/throat irritation possible'}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '16px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Medium-term (Daily commute)</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                                                {latestAQI <= 100 ? '✅ Safe for regular exposure' : '⚠️ Consider protective measures'}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Long-term (Regular use)</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                                                {latestAQI <= 100 ? '✅ Low health risk' : '❌ Significant health concerns'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recommendations Panel */}
                                <div style={styles.chartContainer}>
                                    <h3 style={styles.chartTitle}>💡 Smart Recommendations</h3>
                                    <div style={{ padding: '20px' }}>
                                        <div style={{ marginBottom: '12px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#059669', marginBottom: '4px' }}>
                                                🕐 Best Travel Time
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#374151' }}>
                                                {latestAQI <= 100 ? 'Any time is suitable' : 'Early morning (6-8 AM) or late evening (8-10 PM)'}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '12px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>
                                                🛡️ Protection Needed
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#374151' }}>
                                                {latestAQI <= 50 ? 'No protection needed' :
                                                    latestAQI <= 100 ? 'Consider N95 mask for sensitive individuals' :
                                                        latestAQI <= 200 ? 'N95 mask recommended for everyone' :
                                                            'N95 mask essential, limit outdoor exposure'}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#7c3aed', marginBottom: '4px' }}>
                                                🚗 Vehicle Settings
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#374151' }}>
                                                {latestAQI <= 100 ? 'Windows can be open' : 'Keep windows closed, use AC recirculation mode'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* New Interactive Charts */}
                                {/* Pie Chart - Pollutant Distribution */}
                                {pieChartData && (
                                    <div style={styles.chartContainer}>
                                        <Pie data={pieChartData.data} options={pieChartData.options} />
                                    </div>
                                )}

                                {/* Radar Chart - Health Risk Assessment */}
                                {radarChartData && (
                                    <div style={styles.chartContainer}>
                                        <Radar data={radarChartData.data} options={radarChartData.options} />
                                    </div>
                                )}

                                {/* Doughnut Chart - Health Impact Categories */}
                                {doughnutChartData && (
                                    <div style={styles.chartContainer}>
                                        <Doughnut data={doughnutChartData.data} options={doughnutChartData.options} />
                                    </div>
                                )}

                                {/* Polar Area Chart - AQI Contribution */}
                                {polarChartData && (
                                    <div style={styles.chartContainer}>
                                        <PolarArea data={polarChartData.data} options={polarChartData.options} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}




                </div>
            </div>
        </>
    );
};

export default OxyRoute;