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

  // Fetch weather data for city
  const fetchWeather = async (cityToFetch: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(cityToFetch)}`);
      if (!response.ok) {
        throw new Error("날씨 데이터를 불러오지 못했습니다. 도시 이름을 영어 또는 국문으로 정확히 기입해보세요.");
      }
      const data: WeatherData = await response.json();
      setWeatherData(data);
      setCurrentCity(data.location.name);
    } catch (err: any) {
      setError(err.message || "날씨 정보를 읽어오는 도중 서버 연결에 실패했습니다.");
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
        throw new Error("전국 평균 날씨 데이터를 불러오지 못했습니다. 국가 이름을 한글이나 영문으로 정확히 입력해보세요.");
      }
      const data: NationalWeatherData = await response.json();
      setNationalData(data);
      setCurrentCountry(data.country);
    } catch (err: any) {
      setNationalError(err.message || "전국 날씨 정보를 분석하는 도중 오류가 발생했습니다.");
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
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-800">오늘의 날씨</h1>
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
                  placeholder="도시 이름으로 검색해보세요 (예: 서울, Jeju, Tokyo, Paris...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-28 py-3.5 bg-slate-50/50 rounded-2xl border border-transparent focus:border-slate-200/80 focus:bg-white/90 focus:outline-none text-sm font-semibold transition-all"
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
                  placeholder="국가 이름으로 전국 기후 평균을 검색해보세요 (예: 대한민국, 일본, 미국, 프랑스...)"
                  value={nationalSearchQuery}
                  onChange={(e) => setNationalSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-28 py-3.5 bg-slate-50/50 rounded-2xl border border-transparent focus:border-indigo-200/80 focus:bg-white/90 focus:outline-none text-sm font-semibold transition-all"
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

