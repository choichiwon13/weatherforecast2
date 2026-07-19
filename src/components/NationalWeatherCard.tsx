import React from "react";
import { NationalWeatherData } from "../types";
import { WeatherIcon } from "./WeatherIcon";
import { Thermometer, Droplets, Sparkles, Globe, MapPin } from "lucide-react";
import { motion } from "motion/react";

interface NationalWeatherCardProps {
  data: NationalWeatherData;
}

export const NationalWeatherCard: React.FC<NationalWeatherCardProps> = ({ data }) => {
  // Fine dust assessment helper
  const getPm25Status = (val: number) => {
    if (val <= 15) return { text: "좋음", color: "text-emerald-500 bg-emerald-500/10" };
    if (val <= 35) return { text: "보통", color: "text-blue-500 bg-blue-500/10" };
    if (val <= 75) return { text: "나쁨", color: "text-amber-500 bg-amber-500/10" };
    return { text: "매우 나쁨", color: "text-rose-500 bg-rose-500/10" };
  };

  const pm25Info = getPm25Status(data.average_pm2_5);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="space-y-6">
      {/* Country Hero Header Dashboard */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-indigo-950/20"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Globe size={180} className="text-white animate-pulse" />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-1.5 opacity-80">
              <Globe size={16} className="text-indigo-400" />
              <span className="text-xs font-bold tracking-wider uppercase text-indigo-300">National Average Weather</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-1">
              {data.country} <span className="text-lg font-medium text-slate-400">전국 날씨 현황</span>
            </h2>
            <div className="mt-2.5 inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-indigo-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>실시간 전국 기후 분석 데이터</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-white/5 border border-white/10 px-5 py-4 rounded-2xl">
            <WeatherIcon code={data.dominant_condition_code} size={54} className="drop-shadow-md text-white" />
            <div>
              <span className="text-xs text-indigo-300 font-bold">대표 기상 현황</span>
              <p className="text-lg font-black">{data.dominant_condition}</p>
            </div>
          </div>
        </div>

        {/* 3 Main Average Metrics */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-col">
            <span className="text-xs text-indigo-300 font-bold flex items-center mb-1">
              <Thermometer size={14} className="mr-1 text-rose-400" /> 평균 기온
            </span>
            <span className="text-xl sm:text-2xl font-black tracking-tight">{Math.round(data.average_temp_c * 10) / 10}°C</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-indigo-300 font-bold flex items-center mb-1">
              <Droplets size={14} className="mr-1 text-blue-400" /> 평균 습도
            </span>
            <span className="text-xl sm:text-2xl font-black tracking-tight">{Math.round(data.average_humidity)}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-indigo-300 font-bold flex items-center mb-1">
              <Sparkles size={14} className="mr-1 text-emerald-400" /> 초미세먼지
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight">{Math.round(data.average_pm2_5)}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${pm25Info.color} scale-90 border border-current/20`}>
                {pm25Info.text}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI National Climate Summary */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 relative overflow-hidden"
      >
        <div className="flex items-center space-x-2 mb-3">
          <Sparkles className="text-indigo-600 animate-pulse" size={18} />
          <h3 className="text-sm font-bold text-slate-800">AI 기후 분석관 리포트</h3>
        </div>
        <p className="text-slate-700 leading-relaxed font-medium text-sm md:text-base">
          {data.ai_summary}
        </p>
      </motion.div>

      {/* Major Cities Detailed Weather List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2 px-1">
          <MapPin size={18} className="text-indigo-500" />
          <span>전국 주요 도시별 현재 상황</span>
        </h3>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        >
          {data.cities.map((city) => (
            <motion.div
              key={city.name}
              variants={itemVariants}
              whileHover={{ y: -3, scale: 1.01 }}
              className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <span className="text-sm font-bold text-slate-800">{city.name}</span>
                <WeatherIcon code={city.condition_code} size={22} />
              </div>
              
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-xs text-slate-400 font-semibold">{city.condition}</span>
                <span className="text-base font-black text-slate-800">{Math.round(city.temp_c)}°C</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
