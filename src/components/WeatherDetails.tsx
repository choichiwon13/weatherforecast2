import React from "react";
import { CurrentWeather } from "../types";
import { Thermometer, Wind, Droplets, Sun, ShieldAlert, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface WeatherDetailsProps {
  current: CurrentWeather;
}

export const WeatherDetails: React.FC<WeatherDetailsProps> = ({ current }) => {
  // Fine dust assessment helper
  const getPm25Status = (val: number) => {
    if (val <= 15) return { text: "좋음", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
    if (val <= 35) return { text: "보통", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" };
    if (val <= 75) return { text: "나쁨", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
    return { text: "매우 나쁨", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" };
  };

  const getPm10Status = (val: number) => {
    if (val <= 30) return { text: "좋음", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
    if (val <= 80) return { text: "보통", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" };
    if (val <= 150) return { text: "나쁨", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
    return { text: "매우 나쁨", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" };
  };

  const getUvStatus = (val: number) => {
    if (val <= 2) return { text: "낮음", color: "text-emerald-500" };
    if (val <= 5) return { text: "보통", color: "text-blue-500" };
    if (val <= 7) return { text: "높음", color: "text-amber-500" };
    if (val <= 10) return { text: "매우 높음", color: "text-rose-500" };
    return { text: "위험", color: "text-purple-500 animate-pulse" };
  };

  const pm25 = getPm25Status(current.pm2_5);
  const pm10 = getPm10Status(current.pm10);
  const uvInfo = getUvStatus(current.uv);

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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 gap-4"
    >
      {/* Feels Like Temperature Card */}
      <motion.div 
        variants={itemVariants}
        className="p-5 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-400 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between border border-white/10"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white/90">체감 온도</span>
          <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
            <Thermometer className="text-white" size={20} />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-black text-white">{current.feelslike_c}°C</span>
          <p className="text-xs text-white/80 font-medium mt-1">실제 온도 대비 체감 강도</p>
        </div>
      </motion.div>

      {/* Humidity Card */}
      <motion.div 
        variants={itemVariants}
        className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between border border-white/10"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white/90">대기 습도</span>
          <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
            <Droplets className="text-white" size={20} />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-black text-white">{current.humidity}%</span>
          <p className="text-xs text-white/80 font-medium mt-1">
            {current.humidity > 70 ? "꿉꿉하고 높은 습도" : current.humidity < 30 ? "건조한 대기 상태" : "적정하고 쾌적한 습도"}
          </p>
        </div>
      </motion.div>

      {/* Wind Card */}
      <motion.div 
        variants={itemVariants}
        className="p-5 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between border border-white/10"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white/90">풍속</span>
          <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
            <Wind className="text-white" size={20} />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-black text-white">{current.wind_kph} km/h</span>
          <p className="text-xs text-white/80 font-medium mt-1">
            {current.wind_kph > 20 ? "다소 시원하거나 강한 바람" : "잔잔하고 편안한 미풍"}
          </p>
        </div>
      </motion.div>

      {/* UV Card */}
      <motion.div 
        variants={itemVariants}
        className="p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between border border-white/10"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white/90">자외선 지수</span>
          <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
            <Sun className="text-white" size={20} />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">{current.uv}</span>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-white/20 border border-white/30 text-white">
              {uvInfo.text}
            </span>
          </div>
          <p className="text-xs text-white/80 font-medium mt-1">지수에 따른 피부 보호 권장</p>
        </div>
      </motion.div>

      {/* PM2.5 Fine Dust Card */}
      <motion.div 
        variants={itemVariants}
        className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between border border-white/10"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white/90">초미세먼지 (PM2.5)</span>
          <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
            <Sparkles className="text-white" size={20} />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">{current.pm2_5} <span className="text-xs font-normal text-white/70">㎍/㎥</span></span>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white">
              {pm25.text}
            </span>
          </div>
          <p className="text-xs text-white/80 font-medium mt-1">입경 2.5㎛ 이하 미세먼지</p>
        </div>
      </motion.div>

      {/* PM10 Fine Dust Card */}
      <motion.div 
        variants={itemVariants}
        className="p-5 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between border border-white/10"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white/90">미세먼지 (PM10)</span>
          <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
            <ShieldAlert className="text-white" size={20} />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">{current.pm10} <span className="text-xs font-normal text-white/70">㎍/㎥</span></span>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white">
              {pm10.text}
            </span>
          </div>
          <p className="text-xs text-white/80 font-medium mt-1">입경 10㎛ 이하 대기 오염 물질</p>
        </div>
      </motion.div>
    </motion.div>
  );
};
