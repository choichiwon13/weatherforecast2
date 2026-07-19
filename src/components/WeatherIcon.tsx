import React from "react";
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, HelpCircle } from "lucide-react";

interface WeatherIconProps {
  code: string;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ code, className = "", size = 24 }) => {
  const normCode = code.toLowerCase();

  if (normCode.includes("sunny") || normCode.includes("sun") || normCode.includes("clear") || normCode.includes("맑음")) {
    return <Sun className={`text-amber-500 animate-pulse ${className}`} size={size} />;
  }
  if (normCode.includes("rainy") || normCode.includes("rain") || normCode.includes("비") || normCode.includes("소나기")) {
    return <CloudRain className={`text-blue-400 ${className}`} size={size} />;
  }
  if (normCode.includes("snowy") || normCode.includes("snow") || normCode.includes("눈") || normCode.includes("진눈깨비")) {
    return <CloudSnow className={`text-sky-300 ${className}`} size={size} />;
  }
  if (normCode.includes("thunderstorm") || normCode.includes("thunder") || normCode.includes("lightning") || normCode.includes("번개") || normCode.includes("뇌우")) {
    return <CloudLightning className={`text-violet-400 ${className}`} size={size} />;
  }
  if (normCode.includes("cloudy") || normCode.includes("cloud") || normCode.includes("흐림") || normCode.includes("구름")) {
    return <Cloud className={`text-slate-400 ${className}`} size={size} />;
  }

  // Fallback icon
  return <HelpCircle className={`text-emerald-400 ${className}`} size={size} />;
};
