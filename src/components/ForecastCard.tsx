import React from "react";
import { ForecastDay } from "../types";
import { WeatherIcon } from "./WeatherIcon";
import { Calendar } from "lucide-react";
import { motion } from "motion/react";

interface ForecastCardProps {
  forecast: ForecastDay[];
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ forecast }) => {
  // Format date string to display neatly (e.g. 7월 18일)
  const formatForecastDate = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return `${parseInt(parts[1], 10)}월 ${parseInt(parts[2], 10)}일`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getDayTheme = (code: string) => {
    const norm = code.toLowerCase();
    if (norm.includes("sunny") || norm.includes("sun") || norm.includes("clear") || norm.includes("맑음")) {
      return {
        bg: "bg-amber-500/5 hover:bg-amber-500/10 border-transparent hover:border-amber-200/60",
        dateColor: "text-amber-800",
        tempBar: "from-amber-400 to-orange-400"
      };
    }
    if (norm.includes("rainy") || norm.includes("rain") || norm.includes("비") || norm.includes("소나기")) {
      return {
        bg: "bg-blue-500/5 hover:bg-blue-500/10 border-transparent hover:border-blue-200/60",
        dateColor: "text-blue-800",
        tempBar: "from-blue-400 to-indigo-400"
      };
    }
    if (norm.includes("snowy") || norm.includes("snow") || norm.includes("눈") || norm.includes("진눈깨비")) {
      return {
        bg: "bg-sky-500/5 hover:bg-sky-500/10 border-transparent hover:border-sky-200/60",
        dateColor: "text-sky-800",
        tempBar: "from-sky-300 to-blue-400"
      };
    }
    if (norm.includes("thunderstorm") || norm.includes("thunder") || norm.includes("lightning") || norm.includes("번개") || norm.includes("뇌우")) {
      return {
        bg: "bg-violet-500/5 hover:bg-violet-500/10 border-transparent hover:border-violet-200/60",
        dateColor: "text-violet-800",
        tempBar: "from-violet-400 to-indigo-500"
      };
    }
    // Cloudy/other
    return {
      bg: "bg-slate-500/5 hover:bg-slate-500/10 border-transparent hover:border-slate-200/60",
      dateColor: "text-slate-800",
      tempBar: "from-slate-400 to-slate-500"
    };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    show: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center space-x-2 pb-5 border-b border-slate-50 mb-4">
        <Calendar className="text-indigo-500 animate-pulse" size={20} />
        <h3 className="text-lg font-bold text-slate-800">3일 기상 예보</h3>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {forecast.map((day, idx) => {
          const dayTheme = getDayTheme(day.condition_code);
          return (
            <motion.div
              key={day.date}
              variants={itemVariants}
              whileHover={{ scale: 1.01, x: 2 }}
              className={`flex items-center justify-between p-4 rounded-2xl ${dayTheme.bg} transition-all border`}
            >
              {/* Left: Date and Day of Week */}
              <div className="flex flex-col">
                <span className={`text-sm font-bold ${dayTheme.dateColor}`}>
                  {idx === 0 ? "오늘" : day.day_of_week}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  {formatForecastDate(day.date)}
                </span>
              </div>

              {/* Middle: Condition details */}
              <div className="flex items-center space-x-3">
                <WeatherIcon code={day.condition_code} size={28} />
                <span className="text-sm font-semibold text-slate-600 hidden sm:inline">
                  {day.condition}
                </span>
              </div>

              {/* Right: Min/Max Temperature Bar */}
              <div className="flex items-center space-x-4">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">최저</span>
                  <span className="text-sm font-black text-blue-500">{Math.round(day.mintemp_c)}°C</span>
                </div>
                <div className="w-12 h-1.5 bg-slate-200/60 rounded-full overflow-hidden relative hidden xs:block">
                  <div 
                    className={`absolute top-0 bottom-0 bg-gradient-to-r ${dayTheme.tempBar} rounded-full`}
                    style={{ left: "15%", right: "15%" }}
                  />
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">최고</span>
                  <span className="text-sm font-black text-rose-500">{Math.round(day.maxtemp_c)}°C</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
