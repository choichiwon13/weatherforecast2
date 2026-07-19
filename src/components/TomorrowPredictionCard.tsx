import React from "react";
import { TomorrowPrediction } from "../types";
import { WeatherIcon } from "./WeatherIcon";
import { 
  Sparkles, 
  Sun, 
  Droplets, 
  Wind, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  HelpCircle,
  AlertTriangle
} from "lucide-react";
import { motion } from "motion/react";

interface TomorrowPredictionCardProps {
  prediction: TomorrowPrediction | null | undefined;
}

export const TomorrowPredictionCard: React.FC<TomorrowPredictionCardProps> = ({ prediction }) => {
  if (!prediction) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center min-h-[250px]">
        <HelpCircle className="text-slate-300 mb-2 animate-bounce" size={40} />
        <p className="text-slate-500 font-medium">내일의 상세 예측 정보를 로딩하고 있습니다...</p>
      </div>
    );
  }

  // UV level text & color styling
  const getUvInfo = (uv: number) => {
    if (uv >= 8) return { text: "매우 강함", color: "from-red-500 to-rose-600" };
    if (uv >= 6) return { text: "강함", color: "from-orange-500 to-red-500" };
    if (uv >= 3) return { text: "보통", color: "from-amber-400 to-orange-500" };
    return { text: "낮음", color: "from-emerald-400 to-teal-500" };
  };

  // Fine dust styling
  const getPm25Style = (val: number) => {
    if (val > 75) return { text: "매우 나쁨", color: "from-red-500 to-rose-600" };
    if (val > 35) return { text: "나쁨", color: "from-orange-400 to-orange-600" };
    if (val > 15) return { text: "보통", color: "from-teal-400 to-cyan-500" };
    return { text: "좋음", color: "from-emerald-400 to-teal-500" };
  };

  const uvStyle = getUvInfo(prediction.uv);
  const pm25Style = getPm25Style(prediction.pm2_5);

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.08,
        duration: 0.4
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
    >
      {/* Header section */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-50 mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-violet-500 animate-pulse" size={20} />
            <h3 className="text-lg font-bold text-slate-800">내일 날씨 AI 예측 리포트</h3>
          </div>
          <span className="text-xs bg-violet-50 text-violet-600 font-extrabold px-2.5 py-1 rounded-full border border-violet-100">
            Tomorrow Smart Forecast
          </span>
        </div>

        {/* Hero section: Tomorrow's Main Weather */}
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-indigo-50 via-slate-50 to-violet-50/50 rounded-2xl p-5 border border-indigo-100/30 flex flex-col sm:flex-row items-center justify-between gap-4 mb-5"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white shadow-sm rounded-2xl border border-indigo-100/20">
              <WeatherIcon code={prediction.condition_code} size={48} />
            </div>
            <div>
              <p className="text-xs text-indigo-500/80 font-bold">내일 전체 기상 전망</p>
              <h4 className="text-xl font-extrabold text-slate-800 mt-0.5">{prediction.condition}</h4>
              <p className="text-sm text-slate-400 font-medium mt-0.5">
                기온 범위: <span className="text-blue-500 font-bold">{Math.round(prediction.temp_min)}°C</span> ~ <span className="text-rose-500 font-bold">{Math.round(prediction.temp_max)}°C</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-indigo-100/40 rounded-xl px-4 py-2 shadow-sm self-stretch sm:self-auto justify-center">
            <TrendingUp className="text-indigo-500" size={16} />
            <span className="text-xs font-bold text-slate-600">
              오늘 기온 대비 유사 기조
            </span>
          </div>
        </motion.div>

        {/* Timeline: Morning, Afternoon, Evening */}
        <div className="mb-5">
          <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Clock size={13} className="text-slate-400" />
            내일 시간대별 상세 예측
          </h5>
          <div className="grid grid-cols-3 gap-3">
            {/* Morning */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col items-center text-center"
            >
              <span className="text-[11px] font-bold text-slate-500">아침 (08시)</span>
              <div className="my-2 bg-white p-1 rounded-xl shadow-xs border border-slate-100/50">
                <WeatherIcon code={prediction.condition_code} size={22} />
              </div>
              <span className="text-sm font-black text-slate-700">{Math.round(prediction.morning_temp)}°C</span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-full px-1">
                {prediction.morning_condition}
              </span>
            </motion.div>

            {/* Afternoon */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="p-3 rounded-2xl bg-amber-50/30 border border-amber-100/30 flex flex-col items-center text-center"
            >
              <span className="text-[11px] font-bold text-amber-600">오후 (14시)</span>
              <div className="my-2 bg-white p-1 rounded-xl shadow-xs border border-amber-100/30">
                <WeatherIcon code={prediction.condition_code} size={22} />
              </div>
              <span className="text-sm font-black text-amber-700">{Math.round(prediction.afternoon_temp)}°C</span>
              <span className="text-[10px] text-amber-600/80 font-medium mt-0.5 truncate max-w-full px-1">
                {prediction.afternoon_condition}
              </span>
            </motion.div>

            {/* Evening */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="p-3 rounded-2xl bg-indigo-50/30 border border-indigo-100/30 flex flex-col items-center text-center"
            >
              <span className="text-[11px] font-bold text-indigo-600">저녁 (20시)</span>
              <div className="my-2 bg-white p-1 rounded-xl shadow-xs border border-indigo-100/30">
                <WeatherIcon code={prediction.condition_code} size={22} />
              </div>
              <span className="text-sm font-black text-indigo-700">{Math.round(prediction.evening_temp)}°C</span>
              <span className="text-[10px] text-indigo-600/80 font-medium mt-0.5 truncate max-w-full px-1">
                {prediction.evening_condition}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Environmental Indices Grid */}
        <div className="mb-5">
          <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
            내일의 주요 환경 지표
          </h5>
          <div className="grid grid-cols-2 xs:grid-cols-4 gap-3">
            {/* UV Index */}
            <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100 flex items-center space-x-2.5">
              <div className="p-1.5 bg-amber-100/50 text-amber-500 rounded-lg">
                <Sun size={15} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">자외선</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-xs font-black text-slate-700">{prediction.uv}</span>
                  <span className="text-[9px] text-amber-600 font-extrabold">({uvStyle.text})</span>
                </div>
              </div>
            </div>

            {/* Humidity */}
            <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100 flex items-center space-x-2.5">
              <div className="p-1.5 bg-blue-100/50 text-blue-500 rounded-lg">
                <Droplets size={15} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">습도</span>
                <span className="text-xs font-black text-slate-700">{prediction.humidity}%</span>
              </div>
            </div>

            {/* Wind speed */}
            <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100 flex items-center space-x-2.5">
              <div className="p-1.5 bg-sky-100/50 text-sky-500 rounded-lg">
                <Wind size={15} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">풍속</span>
                <span className="text-xs font-black text-slate-700">{prediction.wind_kph} km/h</span>
              </div>
            </div>

            {/* PM2.5 Fine dust */}
            <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100 flex items-center space-x-2.5">
              <div className="p-1.5 bg-emerald-100/50 text-emerald-500 rounded-lg">
                <Sparkles size={15} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">초미세먼지</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-xs font-black text-slate-700">{prediction.pm2_5}</span>
                  <span className="text-[9px] text-emerald-600 font-extrabold">({pm25Style.text})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer AI Forecaster analysis */}
      <motion.div 
        variants={itemVariants}
        className="p-4 rounded-2xl bg-gradient-to-tr from-violet-500/5 to-indigo-500/10 border border-indigo-100/40 text-slate-700 relative overflow-hidden"
      >
        <div className="flex items-start space-x-2">
          <Sparkles className="text-indigo-500 shrink-0 mt-0.5 animate-pulse" size={16} />
          <div>
            <h6 className="text-xs font-black text-indigo-700">AI 기상 분석 위젯 제언</h6>
            <p className="text-xs leading-relaxed font-semibold text-slate-600 mt-1">
              "{prediction.analysis}"
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
