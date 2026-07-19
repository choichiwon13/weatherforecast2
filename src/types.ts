export interface WeatherLocation {
  name: string;
  country: string;
  localtime: string;
}

export interface CurrentWeather {
  temp_c: number;
  feelslike_c: number;
  condition: string;
  condition_code: "sunny" | "cloudy" | "rainy" | "snowy" | "thunderstorm" | string;
  wind_kph: number;
  humidity: number;
  uv: number;
  pm2_5: number;
  pm10: number;
}

export interface ForecastDay {
  date: string;
  day_of_week: string;
  maxtemp_c: number;
  mintemp_c: number;
  condition: string;
  condition_code: "sunny" | "cloudy" | "rainy" | "snowy" | "thunderstorm" | string;
}

export interface AiInsights {
  summary: string;
  clothing: string[];
  activities: string[];
  health: string;
}

export interface YesterdayComparison {
  temp_diff_c: number;
  summary: string;
}

export interface TomorrowPrediction {
  temp_min: number;
  temp_max: number;
  condition: string;
  condition_code: "sunny" | "cloudy" | "rainy" | "snowy" | "thunderstorm" | string;
  uv: number;
  humidity: number;
  wind_kph: number;
  pm2_5: number;
  pm10: number;
  analysis: string;
  morning_temp: number;
  afternoon_temp: number;
  evening_temp: number;
  morning_condition: string;
  afternoon_condition: string;
  evening_condition: string;
}

export interface WeatherData {
  location: WeatherLocation;
  current: CurrentWeather;
  forecast: ForecastDay[];
  ai_insights: AiInsights;
  yesterday_comparison: YesterdayComparison;
  tomorrow_prediction: TomorrowPrediction;
}

export interface CityWeatherBrief {
  name: string;
  temp_c: number;
  condition: string;
  condition_code: "sunny" | "cloudy" | "rainy" | "snowy" | "thunderstorm" | string;
}

export interface NationalWeatherData {
  country: string;
  average_temp_c: number;
  average_humidity: number;
  average_pm2_5: number;
  dominant_condition: string;
  dominant_condition_code: "sunny" | "cloudy" | "rainy" | "snowy" | "thunderstorm" | string;
  cities: CityWeatherBrief[];
  ai_summary: string;
}
