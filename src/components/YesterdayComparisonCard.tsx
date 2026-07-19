import React from "react";
import { motion } from "motion/react";
import { Thermometer, ArrowUpRight, ArrowDownRight, Equal, CalendarDays } from "lucide-react";
import { YesterdayComparison } from "../types";

interface YesterdayComparisonCardProps {
  comparison: YesterdayComparison | null;
}

export const YesterdayComparisonCard: React.FC<YesterdayComparisonCardProps> = ({ comparison }) => {
  if (!comparison) return null;

  const { temp_diff_c, summary } = comparison;

  // Formatting and styling based on temp difference
  const isWarmer = temp_diff_c > 0;
  const isColder = temp_diff_c < 0;
  const isEqual = temp_diff_c === 0;

  const getDiffText = () => {
    if (isWarmer) return `어제보다 ${temp_diff_c.toFixed(1)}°C 높음`;
    if (isColder) return `어제보다 ${Math.abs(temp_diff_c).toFixed(1)}°C 낮음`;
    return "어제와 기온이 동일함";
  };

  const badgeColor = isWarmer
    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
    : isColder
    ? "bg-sky-500/10 text-sky-600 border-sky-500/20"
    : "bg-slate-500/10 text-slate-600 border-slate-500/20";

  const iconBg = isWarmer
    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
    : isColder
    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
    : "bg-slate-500 text-white";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="yesterday-comparison-card"
      className="backdrop-blur-xl bg-white/75 border border-white/40 p-5 rounded-3xl shadow-xl shadow-slate-100/50 flex flex-col md:flex-row items-center gap-4 transition-all duration-300 hover:shadow-2xl"
    >
      <div className={`p-3 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {isWarmer && <ArrowUpRight className="w-6 h-6 animate-pulse" />}
        {isColder && <ArrowDownRight className="w-6 h-6 animate-pulse" />}
        {isEqual && <Equal className="w-6 h-6" />}
      </div>

      <div className="flex-1 text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
            <CalendarDays className="w-3.5 h-3.5" /> 전날 대비 기온 비교
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
            {getDiffText()}
          </span>
        </div>
        <p className="text-slate-800 text-sm md:text-base font-medium leading-relaxed">
          {summary || "어제 기상 정보를 성공적으로 불러왔습니다."}
        </p>
      </div>

      {/* Mini temperature visualizer meter */}
      <div className="shrink-0 hidden sm:flex flex-col items-center justify-center px-4 py-2 border-l border-slate-200/50">
        <span className="text-xs font-semibold text-slate-400 mb-1">온도차</span>
        <span className={`text-2xl font-black ${isWarmer ? "text-amber-500" : isColder ? "text-sky-500" : "text-slate-500"}`}>
          {isWarmer ? "+" : ""}
          {temp_diff_c.toFixed(1)}°C
        </span>
      </div>
    </motion.div>
  );
};
