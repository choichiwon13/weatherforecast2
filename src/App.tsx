import React, { useState, useEffect } from "react";
import { WeatherData, NationalWeatherData } from "./types";
import { WeatherIcon } from "./components/WeatherIcon";
import { WeatherDetails } from "./components/WeatherDetails";
import { ForecastCard } from "./components/ForecastCard";
import { AiInsights } from "./components/AiInsights";
import { NationalWeatherCard } from "./components/NationalWeatherCard";
import { YesterdayComparisonCard } from "./components/YesterdayComparisonCard";
import { TomorrowPredictionCard } from "./components/TomorrowPredictionCard";
import { DynamicBackground } from "./components/DynamicBackground";
import { Search, MapPin, CloudSun, AlertCircle, RefreshCw, Thermometer, Info, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const POPULAR_CITIES = [
  { ko: "서울", en: "Seoul" },
  { ko: "부산", en: "Busan" },
  { ko: "제주", en: "Jeju" },
  { ko: "도쿄", en: "Tokyo" },
  { ko: "뉴욕", en: "New York" },
  { ko: "파리", en: "Paris" },
];

const POPULAR_COUNTRIES = [
  { ko: "대한민국", en: "South Korea" },
  { ko: "미국", en: "United States" },
  { ko: "일본", en: "Japan" },
  { ko: "프랑스", en: "France" },
  { ko: "영국", en: "United Kingdom" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"city" | "national">("city");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isNationalDemoMode, setIsNationalDemoMode] = useState(false);
  
  // City weather states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCity, setCurrentCity] = useState("Seoul");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // National average states
  const [nationalSearchQuery, setNationalSearchQuery] = useState("");
  const [currentCountry, setCurrentCountry] = useState("대한민국");
  const [nationalData, setNationalData] = useState<NationalWeatherData | null>(null);
  const [nationalLoading, setNationalLoading] = useState(false);
  const [nationalError, setNationalError] = useState<string | null>(null);

  // Client-side fallback weather data generator for fully offline or static-hosted deployments (e.g., Vercel)
  const getClientFallbackWeather = (city: string): WeatherData => {
    const normalizedCity = city.trim();
    const lowercase = normalizedCity.toLowerCase();
    
    let cityName = normalizedCity;
    let country = "대한민국";
    let temp = 24.5;
    let condition = "구름 조금";
    let conditionCode = "cloudy";
    let humidity = 65;
    let wind = 8.5;
    let uv = 5;
    let pm2_5 = 15;
    let pm10 = 35;

    if (lowercase.includes("seoul") || lowercase.includes("서울")) {
      cityName = "서울";
      country = "대한민국";
      temp = 26.8;
      condition = "맑음";
      conditionCode = "sunny";
      humidity = 60;
      wind = 6.2;
      uv = 6.5;
      pm2_5 = 12;
      pm10 = 28;
    } else if (lowercase.includes("busan") || lowercase.includes("부산")) {
      cityName = "부산";
      country = "대한민국";
      temp = 25.2;
      condition = "구름 많음";
      conditionCode = "cloudy";
      humidity = 70;
      wind = 14.8;
      uv = 4.0;
      pm2_5 = 14;
      pm10 = 32;
    } else if (lowercase.includes("jeju") || lowercase.includes("제주")) {
      cityName = "제주";
      country = "대한민국";
      temp = 27.5;
      condition = "흐리고 비";
      conditionCode = "rainy";
      humidity = 85;
      wind = 18.2;
      uv = 2.0;
      pm2_5 = 8;
      pm10 = 18;
    } else if (lowercase.includes("tokyo") || lowercase.includes("도쿄")) {
      cityName = "도쿄";
      country = "일본";
      temp = 28.0;
      condition = "맑음";
      conditionCode = "sunny";
      humidity = 55;
      wind = 7.5;
      uv = 8.0;
      pm2_5 = 11;
      pm10 = 25;
    } else if (lowercase.includes("new york") || lowercase.includes("뉴욕")) {
      cityName = "뉴욕";
      country = "미국";
      temp = 22.4;
      condition = "흐리고 가끔 비";
      conditionCode = "rainy";
      humidity = 78;
      wind = 11.2;
      uv = 3.0;
      pm2_5 = 18;
      pm10 = 42;
    } else if (lowercase.includes("paris") || lowercase.includes("파리")) {
      cityName = "파리";
      country = "프랑스";
      temp = 20.5;
      condition = "구름 많음";
      conditionCode = "cloudy";
      humidity = 60;
      wind = 9.0;
      uv = 4.5;
      pm2_5 = 10;
      pm10 = 22;
    }

    const dateStr = new Date().toISOString().split("T")[0];
    const timeStr = new Date().toTimeString().slice(0, 5);

    return {
      location: {
        name: cityName,
        country: country,
        localtime: `${dateStr} ${timeStr}`
      },
      current: {
        temp_c: temp,
        feelslike_c: temp + (humidity > 70 ? 2 : 0),
        condition: condition,
        condition_code: conditionCode,
        wind_kph: wind,
        humidity: humidity,
        uv: uv,
        pm2_5: pm2_5,
        pm10: pm10
      },
      forecast: [
        {
          date: dateStr,
          day_of_week: "오늘",
          maxtemp_c: temp + 3,
          mintemp_c: temp - 4,
          condition: condition,
          condition_code: conditionCode
        },
        {
          date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          day_of_week: "내일",
          maxtemp_c: temp + 2,
          mintemp_c: temp - 5,
          condition: conditionCode === "sunny" ? "구름 많음" : "맑음",
          condition_code: conditionCode === "sunny" ? "cloudy" : "sunny"
        },
        {
          date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
          day_of_week: "모레",
          maxtemp_c: temp + 1,
          mintemp_c: temp - 3,
          condition: "흐림",
          condition_code: "cloudy"
        }
      ],
      ai_insights: {
        summary: `현재 ${cityName}의 날씨는 기온 ${temp}°C에 ${condition} 상태입니다. 야외 활동과 일상 생활에 적합한 기상 여건이 조성되어 있습니다.`,
        clothing: ["편안한 면 티셔츠", "가벼운 가디건", "청바지"],
        activities: ["가벼운 동네 산책", "전망 좋은 카페 방문"],
        health: "야외 자외선 수치와 온습도를 확인하시고 편안한 겉옷을 준비하세요."
      },
      yesterday_comparison: {
        temp_diff_c: 1.2,
        summary: `어제보다 기온이 약 1.2°C 높으며 선선한 바람이 불어 기분 좋은 하루입니다.`
      },
      tomorrow_prediction: {
        temp_min: Math.round(temp - 4),
        temp_max: Math.round(temp + 2),
        condition: condition,
        condition_code: conditionCode,
        uv: Math.round(uv),
        humidity: humidity,
        wind_kph: wind,
        pm2_5: pm2_5,
        pm10: pm10,
        analysis: `내일은 오늘과 기조가 유사하지만 오후 들어 바람이 약간 강해질 수 있어 쾌적한 보온이 권장됩니다.`,
        morning_temp: Math.round(temp - 3),
        afternoon_temp: Math.round(temp + 1),
        evening_temp: Math.round(temp - 1),
        morning_condition: "구름 조금",
        afternoon_condition: condition,
        evening_condition: "맑아짐"
      }
    };
  };

  const getClientFallbackNational = (country: string): NationalWeatherData => {
    const norm = country.trim().toLowerCase();
    
    let resCountry = country;
    let avgTemp = 24.5;
    let avgHumid = 65;
    let avgPm = 15;
    let dominant = "맑음";
    let dominantCode = "sunny";
    let aiSummary = `${country} 전역이 전반적으로 고기압의 영향을 받아 온화하고 기분 좋은 대기 상태를 유지하고 있습니다. 일교차에 유의하며 건강한 일상을 계획해 보세요.`;
    let cities = [
      { name: "서울", temp_c: 25, condition: "맑음", condition_code: "sunny" },
      { name: "부산", temp_c: 24, condition: "구름 많음", condition_code: "cloudy" },
      { name: "제주", temp_c: 26, condition: "흐림", condition_code: "cloudy" },
      { name: "대구", temp_c: 27, condition: "맑음", condition_code: "sunny" },
      { name: "인천", temp_c: 23, condition: "맑음", condition_code: "sunny" },
      { name: "광주", temp_c: 25, condition: "구름 많음", condition_code: "cloudy" }
    ];

    if (norm.includes("한국") || norm.includes("대한민국") || norm.includes("korea")) {
      resCountry = "대한민국";
      avgTemp = 26.5;
      avgHumid = 75;
      avgPm = 22;
      dominant = "구름 많음";
      dominantCode = "cloudy";
      aiSummary = "대한민국 전역은 현재 구름이 다소 끼어 있으나 야외 활동하기에 쾌적한 온도를 유지하고 있습니다. 자외선과 습도가 적절한 대기 조건이 지속되고 있습니다.";
      cities = [
        { name: "서울", temp_c: 26, condition: "구름 많음", condition_code: "cloudy" },
        { name: "부산", temp_c: 25, condition: "맑음", condition_code: "sunny" },
        { name: "제주", temp_c: 27, condition: "맑음", condition_code: "sunny" },
        { name: "인천", temp_c: 24, condition: "흐림", condition_code: "cloudy" },
        { name: "대구", temp_c: 28, condition: "맑음", condition_code: "sunny" },
        { name: "광주", temp_c: 26, condition: "구름 많음", condition_code: "cloudy" }
      ];
    } else if (norm.includes("일본") || norm.includes("japan")) {
      resCountry = "일본";
      avgTemp = 27.2;
      avgHumid = 80;
      avgPm = 14;
      dominant = "맑고 다소 무더움";
      dominantCode = "sunny";
      aiSummary = "일본 전국은 전반적으로 높은 기온과 높은 대기 습도를 유지하고 있어 체감 온도가 약간 높을 수 있습니다. 충분한 보습과 수분 섭취가 동반되어야 안전합니다.";
      cities = [
        { name: "도쿄", temp_c: 28, condition: "맑음", condition_code: "sunny" },
        { name: "오사카", temp_c: 29, condition: "맑음", condition_code: "sunny" },
        { name: "삿포로", temp_c: 22, condition: "선선함", condition_code: "sunny" },
        { name: "후쿠오카", temp_c: 27, condition: "흐림", condition_code: "cloudy" },
        { name: "오키나와", temp_c: 31, condition: "소나기", condition_code: "rainy" },
        { name: "교토", temp_c: 28, condition: "맑음", condition_code: "sunny" }
      ];
    } else if (norm.includes("미국") || norm.includes("usa") || norm.includes("united states")) {
      resCountry = "미국";
      avgTemp = 24.8;
      avgHumid = 58;
      avgPm = 11;
      dominant = "화창함";
      dominantCode = "sunny";
      aiSummary = "미국 전역은 쾌적하고 화창한 햇살이 비치는 가운데 서부와 동부를 아울러 대기 질이 대단히 우수하여 주말 야외 스포츠나 피크닉에 대단히 이상적인 하루입니다.";
      cities = [
        { name: "뉴욕", temp_c: 25, condition: "맑음", condition_code: "sunny" },
        { name: "로스앤젤레스", temp_c: 27, condition: "맑음", condition_code: "sunny" },
        { name: "시카고", temp_c: 23, condition: "구름 많음", condition_code: "cloudy" },
        { name: "마이애미", temp_c: 30, condition: "소나기", condition_code: "rainy" },
        { name: "샌프란시스코", temp_c: 19, condition: "선선함", condition_code: "sunny" },
        { name: "시애틀", temp_c: 21, condition: "흐림", condition_code: "cloudy" }
      ];
    } else if (norm.includes("프랑스") || norm.includes("france")) {
      resCountry = "프랑스";
      avgTemp = 22.5;
      avgHumid = 55;
      avgPm = 9;
      dominant = "선선하고 맑음";
      dominantCode = "sunny";
      aiSummary = "프랑스는 매우 맑고 청량한 가을 바람 혹은 쾌적한 서풍의 지배를 받아 대기 오염 물질 수치가 최저로 유지되며 기분 좋은 하루가 지속될 예정입니다.";
      cities = [
        { name: "파리", temp_c: 21, condition: "맑음", condition_code: "sunny" },
        { name: "마르세유", temp_c: 26, condition: "맑음", condition_code: "sunny" },
        { name: "리옹", temp_c: 23, condition: "구름 조금", condition_code: "sunny" },
        { name: "니스", temp_c: 27, condition: "맑음", condition_code: "sunny" },
        { name: "낭트", temp_c: 20, condition: "구름 많음", condition_code: "cloudy" },
        { name: "툴루즈", temp_c: 24, condition: "구름 조금", condition_code: "sunny" }
      ];
    } else if (norm.includes("영국") || norm.includes("uk") || norm.includes("united kingdom")) {
      resCountry = "영국";
      avgTemp = 18.2;
      avgHumid = 72;
      avgPm = 8;
      dominant = "흐림";
      dominantCode = "cloudy";
      aiSummary = "영국 전역은 바다 안개와 상층운의 영향으로 대체로 흐리고 쌀쌀한 날씨가 펼쳐집니다. 실외 이동 시 보온을 위한 가디건과 가벼운 바람막이가 추천됩니다.";
      cities = [
        { name: "런던", temp_c: 19, condition: "구름 많음", condition_code: "cloudy" },
        { name: "맨체스터", temp_c: 17, condition: "가랑비", condition_code: "rainy" },
        { name: "에든버러", temp_c: 15, condition: "흐림", condition_code: "cloudy" },
        { name: "버밍엄", temp_c: 18, condition: "구름 많음", condition_code: "cloudy" },
        { name: "글래스고", temp_c: 14, condition: "흐리고 비", condition_code: "rainy" },
        { name: "벨파스트", temp_c: 16, condition: "흐림", condition_code: "cloudy" }
      ];
    }

    return {
      country: resCountry,
      average_temp_c: avgTemp,
      average_humidity: avgHumid,
      average_pm2_5: avgPm,
      dominant_condition: dominant,
      dominant_condition_code: dominantCode,
      cities: cities,
      ai_summary: aiSummary
    };
  };

  // Fetch weather data for city
  const fetchWeather = async (cityToFetch: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(cityToFetch)}`);
      
      // If Vercel or other hosting returns 404/not ok, trigger client-side fallback
      if (!response.ok) {
        throw new Error("서버에서 기상 데이터를 조회하지 못했습니다. 데모 모드로 안전하게 예측 정보를 불러옵니다.");
      }
      
      const text = await response.text();
      let data: WeatherData;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        throw new Error("올바르지 않은 응답 데이터 포맷입니다. 데모 모드로 자동 전환합니다.");
      }
      
      setWeatherData(data);
      setCurrentCity(data.location.name);
      setIsDemoMode(false);
    } catch (err: any) {
      console.warn("API Error, using custom client fallback data:", err);
      const fallback = getClientFallbackWeather(cityToFetch);
      setWeatherData(fallback);
      setCurrentCity(fallback.location.name);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch national average weather
  const fetchNationalWeather = async (countryToFetch: string) => {
    setNationalLoading(true);
    setNationalError(null);
    try {
      const response = await fetch(`/api/weather/national?country=${encodeURIComponent(countryToFetch)}`);
      if (!response.ok) {
        throw new Error("서버에서 전국 평균 분석 데이터를 조회하지 못했습니다. 데모 모드로 분석을 시뮬레이션합니다.");
      }
      const text = await response.text();
      let data: NationalWeatherData;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        throw new Error("올바르지 않은 국가 데이터 포맷입니다. 데모 모드로 자동 전환합니다.");
      }
      
      setNationalData(data);
      setCurrentCountry(data.country);
      setIsNationalDemoMode(false);
    } catch (err: any) {
      console.warn("National API Error, using custom client fallback:", err);
      const fallback = getClientFallbackNational(countryToFetch);
      setNationalData(fallback);
      setCurrentCountry(fallback.country);
      setIsNationalDemoMode(true);
    } finally {
      setNationalLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(currentCity);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "city") {
      if (searchQuery.trim() !== "") {
        fetchWeather(searchQuery);
      }
    } else {
      if (nationalSearchQuery.trim() !== "") {
        fetchNationalWeather(nationalSearchQuery);
      }
    }
  };

  const handleRefresh = () => {
    if (activeTab === "city") {
      fetchWeather(currentCity);
    } else {
      fetchNationalWeather(currentCountry);
    }
  };

  // Helper for weather-responsive background styling and accents
  const getTheme = () => {
    if (activeTab === "national") {
      return {
        bg: "bg-transparent",
        accent: "from-indigo-600 to-indigo-700",
        card: "bg-indigo-950/80 text-white backdrop-blur-xl border border-white/10"
      };
    }

    if (!weatherData) return {
      bg: "bg-transparent",
      accent: "from-blue-500 to-indigo-500",
      card: "bg-slate-900/85 text-white backdrop-blur-xl border border-white/10"
    };

    const code = weatherData.current.condition_code.toLowerCase();

    if (code.includes("sunny") || code.includes("sun")) {
      return {
        bg: "bg-transparent",
        accent: "from-amber-500 to-orange-500",
        card: "bg-gradient-to-br from-amber-500/85 via-orange-500/85 to-amber-600/90 text-white shadow-xl shadow-orange-500/10 backdrop-blur-xl border border-white/20"
      };
    }
    if (code.includes("rainy") || code.includes("rain") || code.includes("thunderstorm")) {
      return {
        bg: "bg-transparent",
        accent: "from-blue-500 to-indigo-500",
        card: "bg-gradient-to-br from-blue-600/85 to-indigo-500/95 text-white shadow-xl shadow-blue-500/10 backdrop-blur-xl border border-white/20"
      };
    }
    if (code.includes("snowy") || code.includes("snow")) {
      return {
        bg: "bg-transparent",
        accent: "from-sky-400 to-blue-500",
        card: "bg-gradient-to-br from-sky-400/85 to-blue-500/90 text-white shadow-xl shadow-sky-400/15 backdrop-blur-xl border border-white/20"
      };
    }
    // Cloudy/other weather
    return {
      bg: "bg-transparent",
      accent: "from-slate-600 to-blue-600",
      card: "bg-gradient-to-br from-slate-700/85 via-slate-800/85 to-slate-950/90 text-white shadow-xl shadow-slate-950/10 backdrop-blur-xl border border-white/20"
    };
  };

  const theme = getTheme();

  const activeConditionCode = activeTab === "city" 
    ? (weatherData?.current?.condition_code || "sunny")
    : (nationalData?.dominant_condition_code || "sunny");

  return (
    <div className="relative min-h-screen text-slate-800 pb-16 px-4 md:px-6">
      {/* Dynamic Animated Weather Background */}
      <DynamicBackground conditionCode={activeConditionCode} />

      <div className="relative z-10 max-w-4xl mx-auto pt-8">
        
        {/* Header Title with Custom Styling */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-white/75 backdrop-blur-xl rounded-2xl shadow-sm border border-white/40">
              <CloudSun className="text-blue-500 animate-pulse" size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-800">오늘의 날씨</h1>
                {((activeTab === "city" && isDemoMode) || (activeTab === "national" && isNationalDemoMode)) && (
                  <span className="text-[10px] bg-amber-500 text-white font-extrabold px-2 py-0.5 rounded-full shadow-xs animate-pulse border border-amber-400">
                    실시간 데모 모드
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">AI Weather Analytics</p>
            </div>
          </div>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="p-2.5 bg-white/75 backdrop-blur-xl hover:bg-white/90 rounded-2xl shadow-sm border border-white/40 flex items-center space-x-1.5 transition-all text-slate-600 hover:text-slate-800 text-sm font-semibold animate-none cursor-pointer"
          >
            <RefreshCw size={16} className={(activeTab === "city" ? loading : nationalLoading) ? "animate-spin" : ""} />
            <span className="hidden xs:inline">새로고침</span>
          </motion.button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/60 backdrop-blur-xl p-1 rounded-2xl border border-white/30 shadow-sm max-w-sm mb-6">
          <button
            onClick={() => setActiveTab("city")}
            className={`flex-1 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "city"
                ? `bg-gradient-to-r ${theme.accent} text-white shadow-md`
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            도시별 상세 날씨
          </button>
          <button
            onClick={() => {
              setActiveTab("national");
              if (!nationalData) {
                fetchNationalWeather(currentCountry);
              }
            }}
            className={`flex-1 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "national"
                ? "bg-indigo-900 text-white shadow-md"
                : "text-slate-600 hover:text-indigo-900"
            }`}
          >
            국가별 평균 날씨
          </button>
        </div>

        {/* Active Tab: CITY DETAILED WEATHER */}
        {activeTab === "city" && (
          <>
            {/* Search Block */}
            <div className="bg-white/75 backdrop-blur-xl rounded-3xl p-6 border border-white/45 shadow-xl shadow-slate-200/20 mb-6">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="absolute left-4 text-slate-400 pointer-events-none" size={20} />
                <input
                  type="text"
                  placeholder="도시 이름 검색 (예: 서울, Jeju, Tokyo, 파리)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-28 py-3.5 bg-slate-50/50 rounded-2xl border border-transparent focus:border-slate-200/80 focus:bg-white/90 focus:outline-none text-base font-semibold transition-all"
                />
                <button
                  type="submit"
                  className={`absolute right-2 py-2 px-5 text-xs md:text-sm text-white font-bold bg-gradient-to-r ${theme.accent} rounded-xl shadow-md transition-all duration-300 hover:opacity-90 cursor-pointer`}
                >
                  검색
                </button>
              </form>

              {/* Quick Popular Cities */}
              <div className="flex items-center flex-wrap gap-2 mt-4 pt-1">
                <span className="text-xs text-slate-400 font-bold mr-1 flex items-center"><MapPin size={12} className="mr-0.5" /> 인기 검색:</span>
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city.en}
                    onClick={() => {
                      setSearchQuery("");
                      fetchWeather(city.en);
                    }}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-100/80 hover:border-slate-200 transition-all cursor-pointer ${
                      currentCity.toLowerCase() === city.en.toLowerCase() || currentCity === city.ko
                        ? "bg-slate-800 text-white border-transparent"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {city.ko}
                  </button>
                ))}
              </div>
            </div>

            {/* Alert/Error Notification */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 flex items-start space-x-3 text-sm font-medium"
                >
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <p>{error}</p>
                    <p className="text-xs text-rose-500/90 mt-1">
                      * WeatherAPI Key가 등록되지 않은 상태일 경우 Gemini AI가 최신 기상 데이터를 실시간으로 서치합니다. 도시 이름을 국문 또는 정식 영문명으로 시도해 주세요.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Weather Content Block */}
            {loading ? (
              <div className="space-y-6">
                <div className="h-56 rounded-3xl bg-slate-200/50 animate-pulse border border-slate-100" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-32 rounded-2xl bg-slate-200/50 animate-pulse border border-slate-100" />
                  ))}
                </div>
                <div className="h-44 rounded-3xl bg-slate-200/50 animate-pulse border border-slate-100" />
              </div>
            ) : (
              weatherData && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* Hero Main Card */}
                  <div className={`${theme.card} rounded-3xl p-8 relative overflow-hidden transition-all duration-700`}>
                    <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/5 rounded-full pointer-events-none blur-2xl" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div>
                        <div className="flex items-center space-x-1.5 opacity-90">
                          <MapPin size={16} />
                          <span className="text-sm font-bold tracking-wide uppercase">
                            {weatherData.location.country}
                          </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold mt-1 tracking-tight">
                          {weatherData.location.name}
                        </h2>
                        <p className="text-xs opacity-75 font-medium mt-1">
                          측정 일시: {weatherData.location.localtime}
                        </p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <WeatherIcon code={weatherData.current.condition_code} size={64} className="text-white drop-shadow-md" />
                        <div>
                          <div className="flex items-start">
                            <span className="text-5xl md:text-6xl font-black tracking-tighter">
                              {Math.round(weatherData.current.temp_c)}
                            </span>
                            <span className="text-2xl font-bold mt-1">°C</span>
                          </div>
                          <p className="text-sm font-bold opacity-90 mt-1">
                            {weatherData.current.condition}
                          </p>
                        </div>
                      </div>

                      <div className="flex md:flex-col gap-4 md:gap-2 text-sm border-t border-white/10 md:border-t-0 pt-4 md:pt-0">
                        <div className="flex items-center space-x-1.5 opacity-90">
                          <Thermometer size={16} />
                          <span className="font-semibold">체감 온도: {Math.round(weatherData.current.feelslike_c)}°C</span>
                        </div>
                        <div className="flex items-center space-x-1.5 opacity-90">
                          <RefreshCw size={14} />
                          <span className="font-semibold">대기 습도: {weatherData.current.humidity}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <YesterdayComparisonCard comparison={weatherData.yesterday_comparison} />

                  <WeatherDetails current={weatherData.current} />
                  {weatherData.ai_insights && <AiInsights insights={weatherData.ai_insights} />}
                  <TomorrowPredictionCard prediction={weatherData.tomorrow_prediction} />
                  <ForecastCard forecast={weatherData.forecast} />
                </motion.div>
              )
            )}
          </>
        )}

        {/* Active Tab: NATIONAL AVERAGE WEATHER */}
        {activeTab === "national" && (
          <>
            {/* National Search Block */}
            <div className="bg-white/75 backdrop-blur-xl rounded-3xl p-6 border border-white/45 shadow-xl shadow-slate-200/20 mb-6">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Globe className="absolute left-4 text-slate-400 pointer-events-none" size={20} />
                <input
                  type="text"
                  placeholder="국가 이름 검색 (예: 대한민국, 일본, 미국, 프랑스)"
                  value={nationalSearchQuery}
                  onChange={(e) => setNationalSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-28 py-3.5 bg-slate-50/50 rounded-2xl border border-transparent focus:border-indigo-200/80 focus:bg-white/90 focus:outline-none text-base font-semibold transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 py-2 px-5 text-xs md:text-sm text-white font-bold bg-indigo-900 rounded-xl shadow-md hover:bg-indigo-950 transition-all cursor-pointer"
                >
                  분석
                </button>
              </form>

              {/* Quick Popular Countries */}
              <div className="flex items-center flex-wrap gap-2 mt-4 pt-1">
                <span className="text-xs text-slate-400 font-bold mr-1 flex items-center"><Globe size={12} className="mr-0.5" /> 추천 국가:</span>
                {POPULAR_COUNTRIES.map((cnt) => (
                  <button
                    key={cnt.en}
                    onClick={() => {
                      setNationalSearchQuery("");
                      fetchNationalWeather(cnt.ko);
                    }}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-100/80 hover:border-slate-200 transition-all cursor-pointer ${
                      currentCountry.toLowerCase() === cnt.en.toLowerCase() || currentCountry === cnt.ko
                        ? "bg-indigo-900 text-white border-transparent"
                        : "bg-white text-slate-600 hover:bg-indigo-50"
                    }`}
                  >
                    {cnt.ko}
                  </button>
                ))}
              </div>
            </div>

            {/* Alert/Error Notification */}
            <AnimatePresence>
              {nationalError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 flex items-start space-x-3 text-sm font-medium"
                >
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <p>{nationalError}</p>
                    <p className="text-xs text-rose-500/90 mt-1">
                      * Gemini AI의 웹 검색 Grounding 기능을 사용하여 취합하는 과정이므로, 국가 공식 명칭이나 널리 알려진 이름을 영어 또는 한국어로 기재해 주세요.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* National Content Block */}
            {nationalLoading ? (
              <div className="space-y-6">
                <div className="h-64 rounded-3xl bg-slate-200/50 animate-pulse border border-slate-100" />
                <div className="h-32 rounded-3xl bg-slate-200/50 animate-pulse border border-slate-100" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-28 rounded-2xl bg-slate-200/50 animate-pulse border border-slate-100" />
                  ))}
                </div>
              </div>
            ) : (
              nationalData && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <NationalWeatherCard data={nationalData} />
                </motion.div>
              )
            )}
          </>
        )}

        {/* Info Footer */}
        <div className="mt-12 text-center flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center space-x-1 text-xs text-slate-400 font-semibold px-4 text-center">
            <Info size={12} className="shrink-0" />
            <span>본 정보는 실시간 WeatherAPI와 Google Gemini Search Grounding을 통해 실시간 동기화됩니다.</span>
          </div>
          <p className="text-[10px] text-slate-400/80 font-medium">
            오늘의 날씨 © 2026 AI Weather Forecast System.
          </p>
        </div>

      </div>
    </div>
  );
}

