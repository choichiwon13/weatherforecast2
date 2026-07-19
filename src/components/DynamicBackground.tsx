import React from "react";

interface DynamicBackgroundProps {
  conditionCode: string;
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ conditionCode }) => {
  const code = conditionCode?.toLowerCase() || "sunny";

  // Sunny Background
  if (code.includes("sunny") || code.includes("sun") || code.includes("clear")) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-amber-100 via-orange-50 to-slate-50 transition-all duration-1000">
        {/* Glowing Sun center */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-300 to-orange-400 opacity-30 blur-3xl animate-[pulse_6s_infinite]" />
        
        {/* Soft floating sunbeams */}
        <div className="absolute top-[10%] right-[10%] w-[300px] h-[300px] border border-orange-200/20 rounded-full opacity-40 animate-[spin_60s_linear_infinite]" />
        <div className="absolute top-[5%] right-[5%] w-[400px] h-[400px] border border-amber-200/10 rounded-full opacity-20 animate-[spin_90s_linear_infinite_reverse]" />

        {/* Warm floating micro-particles */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-amber-400/30 rounded-full blur-[1px] animate-[float-slow_12s_infinite]"
              style={{
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
                top: `${Math.random() * 80 + 10}%`,
                left: `${Math.random() * 90 + 5}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 8 + 8}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Rainy Background
  if (code.includes("rainy") || code.includes("rain") || code.includes("drizzle") || code.includes("소나기")) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 transition-all duration-1000">
        {/* Dark Cloud masses */}
        <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[50%] bg-slate-900/60 rounded-b-[100px] blur-3xl" />
        <div className="absolute top-[10%] right-[10%] w-[400px] h-[300px] bg-indigo-950/40 rounded-full blur-3xl animate-[float-slow_25s_infinite]" />

        {/* Falling rain drops */}
        <div className="absolute inset-0">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-gradient-to-b from-blue-300/60 to-transparent w-[1.5px] h-[40px] animate-[rain_1.5s_linear_infinite]"
              style={{
                top: `-40px`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: `${Math.random() * 0.6 + 0.8}s`,
                opacity: Math.random() * 0.5 + 0.4,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Thunderstorm Background
  if (code.includes("thunderstorm") || code.includes("thunder") || code.includes("lightning") || code.includes("번개")) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-violet-950 via-slate-900 to-slate-950 transition-all duration-1000">
        {/* Lightning Flash overlay */}
        <div className="absolute inset-0 bg-indigo-100/10 mix-blend-overlay opacity-0 animate-[lightning-flash_8s_infinite]" />

        {/* Dark clouds */}
        <div className="absolute top-[-10%] left-[-5%] w-[110%] h-[40%] bg-zinc-950/80 rounded-b-[80px] blur-3xl" />

        {/* Rain + Heavy Storm Lines */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-gradient-to-b from-indigo-300/40 to-transparent w-[2px] h-[55px] animate-[rain_1.2s_linear_infinite]"
              style={{
                top: `-55px`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1.2}s`,
                animationDuration: `${Math.random() * 0.5 + 0.6}s`,
                transform: "rotate(12deg)",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Snowy Background
  if (code.includes("snowy") || code.includes("snow") || code.includes("눈")) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-sky-950 via-slate-900 to-slate-950 transition-all duration-1000">
        {/* Glowing Auroral Glow */}
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-3xl" />

        {/* Falling Snowflakes */}
        <div className="absolute inset-0">
          {[...Array(40)].map((_, i) => {
            const size = Math.random() * 4 + 2;
            return (
              <div
                key={i}
                className="absolute bg-white rounded-full animate-[snow_8s_linear_infinite]"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  top: `-10px`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${Math.random() * 4 + 6}s`,
                  opacity: Math.random() * 0.7 + 0.3,
                  filter: "blur(0.5px)",
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Cloudy Background
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-slate-200 via-indigo-50/20 to-slate-100 transition-all duration-1000">
      {/* Heavy Giant slow moving clouds */}
      <div className="absolute top-[5%] left-[-10%] w-[500px] h-[250px] bg-white/70 rounded-full blur-3xl animate-[float-slow_40s_infinite]" />
      <div className="absolute top-[25%] right-[-10%] w-[600px] h-[300px] bg-slate-100/60 rounded-full blur-3xl animate-[float-slow_55s_infinite_reverse]" />
      <div className="absolute bottom-[10%] left-[20%] w-[450px] h-[220px] bg-white/40 rounded-full blur-3xl animate-[float-slow_45s_infinite]" />

      {/* Misty floating particles */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/30 rounded-full blur-md animate-[float-slow_20s_infinite]"
            style={{
              width: `${Math.random() * 80 + 40}px`,
              height: `${Math.random() * 40 + 20}px`,
              top: `${Math.random() * 70 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${Math.random() * 12 + 15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
