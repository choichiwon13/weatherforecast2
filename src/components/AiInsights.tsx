import React from "react";
import { AiInsights as AiInsightsType } from "../types";
import { Sparkles, CheckCircle2, Shirt, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

interface AiInsightsProps {
  insights: AiInsightsType;
}

export const AiInsights: React.FC<AiInsightsProps> = ({ insights }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 90 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Caster Briefing Card */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 border border-indigo-500/10 rounded-3xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Sparkles size={120} className="text-indigo-500 animate-spin-slow" />
        </div>
        <div className="flex items-center space-x-2 mb-3">
          <Sparkles className="text-indigo-500 animate-pulse" size={20} />
          <h3 className="text-md font-bold text-slate-800">AI 기상캐스터 맞춤 가이드</h3>
        </div>
        <p className="text-slate-700 leading-relaxed font-medium text-sm md:text-base">
          {insights.summary}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommended Clothing */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm"
        >
          <div className="flex items-center space-x-2 pb-4 border-b border-slate-50 mb-4">
            <Shirt className="text-rose-500" size={20} />
            <h3 className="text-base font-bold text-slate-800">기온 맞춤 추천 코디</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {insights.clothing.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="p-3.5 rounded-2xl bg-rose-50/30 hover:bg-rose-50/50 border border-rose-100/50 text-center flex flex-col justify-center items-center"
              >
                <Shirt size={20} className="text-rose-400 mb-1.5" />
                <span className="text-xs sm:text-sm font-semibold text-rose-700">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Suitable Activities */}
        <motion.div 
          variants={itemVariants}
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-50 mb-4">
              <CheckCircle2 className="text-teal-500" size={20} />
              <h3 className="text-base font-bold text-slate-800">오늘 추천 활동</h3>
            </div>
            <div className="space-y-3">
              {insights.activities.map((act, i) => (
                <div key={i} className="flex items-start space-x-2.5">
                  <CheckCircle2 size={18} className="text-teal-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-600 font-medium">{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Health Recommendation Banner */}
          <div className="mt-5 pt-4 border-t border-slate-50 flex items-start space-x-3">
            <div className="p-2 bg-emerald-50 rounded-xl shrink-0">
              <ShieldCheck className="text-emerald-500" size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-500">건강 주의사항</h4>
              <p className="text-xs text-slate-600 font-medium mt-0.5">{insights.health}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
