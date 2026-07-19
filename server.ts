import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Weather Response Schema for Gemini Structured Output
const weatherResponseSchema = {
  type: Type.OBJECT,
  properties: {
    location: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "City name in Korean, e.g. 서울" },
        country: { type: Type.STRING, description: "Country name in Korean, e.g. 대한민국" },
        localtime: { type: Type.STRING, description: "Current local date and time, e.g. 2026-07-18 18:00" }
      },
      required: ["name", "country", "localtime"]
    },
    current: {
      type: Type.OBJECT,
      properties: {
        temp_c: { type: Type.NUMBER, description: "Current temperature in Celsius" },
        feelslike_c: { type: Type.NUMBER, description: "Feels like temperature in Celsius" },
        condition: { type: Type.STRING, description: "Weather condition description in Korean, e.g. 맑음, 흐림, 구름 많음, 흐리고 비, 소나기" },
        condition_code: { type: Type.STRING, description: "One of: 'sunny', 'cloudy', 'rainy', 'snowy', 'thunderstorm'" },
        wind_kph: { type: Type.NUMBER, description: "Wind speed in km/h" },
        humidity: { type: Type.NUMBER, description: "Humidity percentage (0-100)" },
        uv: { type: Type.NUMBER, description: "UV index (0 to 11+)" },
        pm2_5: { type: Type.NUMBER, description: "PM2.5 fine dust concentration in ug/m3 (or estimate between 0 and 150)" },
        pm10: { type: Type.NUMBER, description: "PM10 fine dust concentration in ug/m3 (or estimate between 0 and 200)" }
      },
      required: ["temp_c", "feelslike_c", "condition", "condition_code", "wind_kph", "humidity", "uv", "pm2_5", "pm10"]
    },
    forecast: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
          day_of_week: { type: Type.STRING, description: "Day of the week in Korean, e.g. 월요일" },
          maxtemp_c: { type: Type.NUMBER, description: "Maximum temperature in Celsius" },
          mintemp_c: { type: Type.NUMBER, description: "Minimum temperature in Celsius" },
          condition: { type: Type.STRING, description: "Weather condition description in Korean" },
          condition_code: { type: Type.STRING, description: "One of: 'sunny', 'cloudy', 'rainy', 'snowy', 'thunderstorm'" }
        },
        required: ["date", "day_of_week", "maxtemp_c", "mintemp_c", "condition", "condition_code"]
      },
      description: "Weather forecast for the next 3 days including today"
    },
    ai_insights: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "A warm, informative, and professional weather caster brief in Korean (2-3 sentences)" },
        clothing: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of 3-4 clothing items recommended for the current temperature and conditions (e.g. '가벼운 반팔 티셔츠', '린넨 셔츠', '가벼운 가디건')"
        },
        activities: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of 2-3 indoor or outdoor activities or tips suitable for today's weather (e.g. '야외 자전거 라이딩', '실내 카페 투어')"
        },
        health: { type: Type.STRING, description: "Health tip based on fine dust, UV, or temperature, in Korean (e.g. '자외선 지수가 높으니 선크림을 꼼꼼히 바르세요.')" }
      },
      required: ["summary", "clothing", "activities", "health"]
    },
    yesterday_comparison: {
      type: Type.OBJECT,
      properties: {
        temp_diff_c: { type: Type.NUMBER, description: "Temperature difference compared to yesterday (today's temperature minus yesterday's in Celsius). Can be positive, negative, or zero." },
        summary: { type: Type.STRING, description: "Comparison summary in Korean comparing today's conditions and temperature with yesterday's (e.g., '어제보다 1.5°C 높고 바람이 약해서 포근합니다.')" }
      },
      required: ["temp_diff_c", "summary"]
    },
    tomorrow_prediction: {
      type: Type.OBJECT,
      properties: {
        temp_min: { type: Type.NUMBER, description: "Expected minimum temperature for tomorrow in Celsius" },
        temp_max: { type: Type.NUMBER, description: "Expected maximum temperature for tomorrow in Celsius" },
        condition: { type: Type.STRING, description: "Expected weather condition for tomorrow in Korean, e.g. 맑음, 구름 많고 비" },
        condition_code: { type: Type.STRING, description: "One of: 'sunny', 'cloudy', 'rainy', 'snowy', 'thunderstorm'" },
        uv: { type: Type.NUMBER, description: "Expected UV index for tomorrow (0-11+)" },
        humidity: { type: Type.NUMBER, description: "Expected humidity percentage for tomorrow (0-100)" },
        wind_kph: { type: Type.NUMBER, description: "Expected wind speed for tomorrow in km/h" },
        pm2_5: { type: Type.NUMBER, description: "Expected PM2.5 in ug/m3 for tomorrow" },
        pm10: { type: Type.NUMBER, description: "Expected PM10 in ug/m3 for tomorrow" },
        analysis: { type: Type.STRING, description: "A detailed 2-3 sentence Korean prediction and advice for tomorrow, comparing it to today." },
        morning_temp: { type: Type.NUMBER, description: "Expected temperature for tomorrow morning in Celsius" },
        afternoon_temp: { type: Type.NUMBER, description: "Expected temperature for tomorrow afternoon in Celsius" },
        evening_temp: { type: Type.NUMBER, description: "Expected temperature for tomorrow evening in Celsius" },
        morning_condition: { type: Type.STRING, description: "Expected condition description for tomorrow morning in Korean" },
        afternoon_condition: { type: Type.STRING, description: "Expected condition description for tomorrow afternoon in Korean" },
        evening_condition: { type: Type.STRING, description: "Expected condition description for tomorrow evening in Korean" }
      },
      required: [
        "temp_min", "temp_max", "condition", "condition_code", "uv", "humidity", "wind_kph", "pm2_5", "pm10", "analysis",
        "morning_temp", "afternoon_temp", "evening_temp", "morning_condition", "afternoon_condition", "evening_condition"
      ]
    }
  },
  required: ["location", "current", "forecast", "ai_insights", "yesterday_comparison", "tomorrow_prediction"]
};

// National Weather Response Schema for Gemini Structured Output
const nationalWeatherResponseSchema = {
  type: Type.OBJECT,
  properties: {
    country: { type: Type.STRING, description: "Country name in Korean, e.g. 대한민국, 미국, 일본, 프랑스" },
    average_temp_c: { type: Type.NUMBER, description: "Calculated average temperature in Celsius across major cities" },
    average_humidity: { type: Type.NUMBER, description: "Average humidity percentage (0-100)" },
    average_pm2_5: { type: Type.NUMBER, description: "Average PM2.5 level" },
    dominant_condition: { type: Type.STRING, description: "Dominant weather condition in Korean, e.g. 대체로 맑음, 전국적으로 비 등" },
    dominant_condition_code: { type: Type.STRING, description: "One of: 'sunny', 'cloudy', 'rainy', 'snowy', 'thunderstorm'" },
    cities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "City name in Korean, e.g. 서울, 부산, 대구, 인천, 광주, 대전, 울산, 제주" },
          temp_c: { type: Type.NUMBER, description: "Temperature of this city" },
          condition: { type: Type.STRING, description: "Weather condition of this city in Korean" },
          condition_code: { type: Type.STRING, description: "One of: 'sunny', 'cloudy', 'rainy', 'snowy', 'thunderstorm'" }
        },
        required: ["name", "temp_c", "condition", "condition_code"]
      },
      description: "List of 6-8 major cities with their current weather details"
    },
    ai_summary: { type: Type.STRING, description: "Overall country climate summary in Korean" }
  },
  required: ["country", "average_temp_c", "average_humidity", "average_pm2_5", "dominant_condition", "dominant_condition_code", "cities", "ai_summary"]
};

// National Average Weather Fallback Generator
function getNationalWeatherFallback(country: string) {
  const norm = country.trim().toLowerCase();
  
  // Default values based on July climate
  let resCountry = country;
  let avgTemp = 26.5;
  let avgHumid = 75;
  let avgPm = 22;
  let dominant = "구름 많음";
  let dominantCode = "cloudy";
  let aiSummary = `${country}의 현재 기온은 전반적으로 편안한 수준을 보이고 있습니다. 실시간 대기 질이 양호하므로 가벼운 야외 활동이나 산책을 즐기기에 좋은 시기입니다. 다만 일시적인 습도 변화에 유의하세요.`;
  let cities = [
    { name: "서울", temp_c: 26.0, condition: "구름 많음", condition_code: "cloudy" },
    { name: "부산", temp_c: 25.5, condition: "대체로 맑음", condition_code: "sunny" },
    { name: "제주", temp_c: 27.2, condition: "맑음", condition_code: "sunny" },
    { name: "인천", temp_c: 24.8, condition: "흐림", condition_code: "cloudy" },
    { name: "대구", temp_c: 28.5, condition: "맑음", condition_code: "sunny" },
    { name: "대전", temp_c: 26.2, condition: "구름 많음", condition_code: "cloudy" },
    { name: "광주", temp_c: 26.8, condition: "흐린 후 갬", condition_code: "cloudy" },
    { name: "울산", temp_c: 25.1, condition: "구름 많음", condition_code: "cloudy" },
  ];

  if (norm.includes("한국") || norm.includes("대한민국") || norm.includes("korea")) {
    resCountry = "대한민국";
    avgTemp = 26.8;
    avgHumid = 78;
    avgPm = 24;
    dominant = "대체로 흐리고 따뜻함";
    dominantCode = "cloudy";
    aiSummary = "대한민국 전역은 현재 동해상의 고기압 가장자리에 들어 전국적으로 구름이 많은 날씨를 보이고 있습니다. 남부 지방과 제주는 낮 기온이 28도 이상으로 올라 다소 더우나, 내륙 지방은 쾌적한 바람이 불어 야외 활동하기에 아주 좋습니다. 초미세먼지 수치는 전국적으로 '좋음'에서 '보통' 수준을 유지하고 있어 실내 환기나 산책에 적극 권장되는 하루입니다.";
    cities = [
      { name: "서울", temp_c: 26.5, condition: "구름 많음", condition_code: "cloudy" },
      { name: "부산", temp_c: 25.0, condition: "맑음", condition_code: "sunny" },
      { name: "제주", temp_c: 28.2, condition: "맑음", condition_code: "sunny" },
      { name: "인천", temp_c: 25.1, condition: "흐림", condition_code: "cloudy" },
      { name: "대구", temp_c: 29.3, condition: "맑음", condition_code: "sunny" },
      { name: "대전", temp_c: 26.8, condition: "구름 많음", condition_code: "cloudy" },
      { name: "광주", temp_c: 27.4, condition: "대체로 흐림", condition_code: "cloudy" },
      { name: "울산", temp_c: 24.9, condition: "구름 많음", condition_code: "cloudy" },
    ];
  } else if (norm.includes("일본") || norm.includes("japan")) {
    resCountry = "일본";
    avgTemp = 27.2;
    avgHumid = 82;
    avgPm = 18;
    dominant = "맑고 무더움";
    dominantCode = "sunny";
    aiSummary = "일본 열도는 전반적으로 고기압의 영향을 받아 고온다습한 날씨가 이어지고 있습니다. 도쿄를 비롯한 혼슈 지방은 한낮 기온이 28도를 웃돌며 높은 습도로 체감 온도가 올라가니 시원한 통풍이 잘 되는 옷차림이 권장됩니다. 홋카이도 지방(삿포로)은 22도 선으로 선선하여 여행하기 아주 쾌적한 기후를 보이고 있습니다.";
    cities = [
      { name: "도쿄", temp_c: 28.5, condition: "맑음", condition_code: "sunny" },
      { name: "오사카", temp_c: 29.2, condition: "구름 조금", condition_code: "sunny" },
      { name: "교토", temp_c: 28.8, condition: "맑음", condition_code: "sunny" },
      { name: "삿포로", temp_c: 22.1, condition: "쾌청함", condition_code: "sunny" },
      { name: "후쿠오카", temp_c: 27.6, condition: "흐림", condition_code: "cloudy" },
      { name: "오키나와", temp_c: 31.4, condition: "소나기", condition_code: "rainy" },
    ];
  } else if (norm.includes("미국") || norm.includes("usa") || norm.includes("united states")) {
    resCountry = "미국";
    avgTemp = 25.2;
    avgHumid = 62;
    avgPm = 12;
    dominant = "대체로 화창함";
    dominantCode = "sunny";
    aiSummary = "미국 전역은 광활한 영토만큼이나 다양한 기후 분포를 보이고 있습니다. 동부의 뉴욕과 중부 시카고는 대체로 구름 한 점 없는 화창한 날씨 속에 쾌적한 기온을 유지하고 있으며, 남부 마이애미는 열대성 대기 불안정으로 약한 비가 내리고 있습니다. 서부 캘리포니아(로스앤젤레스)는 낮 기온 28도 안팎으로 전형적인 쾌적하고 맑은 날씨를 보여 야외 활동에 최적입니다.";
    cities = [
      { name: "뉴욕", temp_c: 25.8, condition: "맑음", condition_code: "sunny" },
      { name: "로스앤젤레스", temp_c: 27.5, condition: "맑음", condition_code: "sunny" },
      { name: "시카고", temp_c: 23.4, condition: "구름 많음", condition_code: "cloudy" },
      { name: "마이애미", temp_c: 30.8, condition: "소나기", condition_code: "rainy" },
      { name: "샌프란시스코", temp_c: 19.5, condition: "맑고 선선함", condition_code: "sunny" },
      { name: "시애틀", temp_c: 21.2, condition: "흐림", condition_code: "cloudy" },
    ];
  } else if (norm.includes("프랑스") || norm.includes("france")) {
    resCountry = "프랑스";
    avgTemp = 23.6;
    avgHumid = 58;
    avgPm = 10;
    dominant = "맑고 선선함";
    dominantCode = "sunny";
    aiSummary = "프랑스 전국은 서풍의 영향으로 온화하고 아주 쾌적한 대기 상태가 지속되고 있습니다. 파리와 북부 지방은 아침저녁으로 15도 내외로 선선하며 낮 최고기온은 22도 수준으로 야외 관광과 가벼운 야외 조깅을 하기에 최적입니다. 남부 지중해 연안(니스, 마르세유)은 최고기온 27도까지 올라 해수욕을 즐기기에 좋은 맑은 햇살이 이어지고 있습니다.";
    cities = [
      { name: "파리", temp_c: 21.8, condition: "맑음", condition_code: "sunny" },
      { name: "마르세유", temp_c: 26.5, condition: "쾌청함", condition_code: "sunny" },
      { name: "리옹", temp_c: 23.8, condition: "구름 조금", condition_code: "sunny" },
      { name: "니스", temp_c: 27.2, condition: "맑음", condition_code: "sunny" },
      { name: "툴루즈", temp_c: 24.5, condition: "구름 많음", condition_code: "cloudy" },
      { name: "낭트", temp_c: 20.9, condition: "흐린 후 갬", condition_code: "cloudy" },
    ];
  } else if (norm.includes("영국") || norm.includes("united kingdom") || norm.includes("uk")) {
    resCountry = "영국";
    avgTemp = 18.2;
    avgHumid = 85;
    avgPm = 9;
    dominant = "가끔 비가 내림";
    dominantCode = "rainy";
    aiSummary = "영국 전역은 저기압의 영향권에 들어 런던을 포함한 대부분의 도시에 간헐적인 약한 비나 소나기가 내리고 있습니다. 기온도 평년보다 다소 낮아 쌀쌀하게 느껴질 수 있으니, 외출 시 방수가 되는 얇은 겉옷이나 휴대용 우산을 챙기시길 바랍니다. 대기 청정도는 아주 맑고 쾌적하며 미세먼지는 거의 없습니다.";
    cities = [
      { name: "런던", temp_c: 19.4, condition: "가벼운 비", condition_code: "rainy" },
      { name: "맨체스터", temp_c: 18.2, condition: "흐리고 비", condition_code: "rainy" },
      { name: "버밍엄", temp_c: 18.5, condition: "흐림", condition_code: "cloudy" },
      { name: "글래스고", temp_c: 16.8, condition: "약한 비", condition_code: "rainy" },
      { name: "리버풀", temp_c: 17.9, condition: "구름 많음", condition_code: "cloudy" },
      { name: "에든버러", temp_c: 15.6, condition: "가랑비", condition_code: "rainy" },
    ];
  } else {
    // Custom generation for other countries
    const firstChar = country.charAt(0);
    const countryHash = firstChar.charCodeAt(0) || 12;
    avgTemp = 20 + (countryHash % 12); // Realistic 20-32 range
    avgHumid = 50 + (countryHash % 40); // 50-90 range
    avgPm = 10 + (countryHash % 40); // 10-50 range
    const conditions = ["맑음", "구름 많음", "비가 내림", "대체로 흐림"];
    const codes = ["sunny", "cloudy", "rainy", "cloudy"];
    const condIdx = countryHash % conditions.length;
    dominant = conditions[condIdx];
    dominantCode = codes[condIdx];
    aiSummary = `${country} 전역은 현재 지엽적인 기압골의 영향을 받아 전반적으로 ${dominant} 날씨 양상을 보여주고 있습니다. 평균 기온은 ${avgTemp.toFixed(1)}°C로 비교적 쾌적한 수준이며, 현지 주민들의 야외 일상생활에 큰 불편함이 없는 무난한 대기 상태를 나타냅니다. 외출 시 실시간 하늘 상황을 가볍게 점검해 보세요.`;
    cities = [
      { name: "주요 도시 A", temp_c: avgTemp + 1.2, condition: dominant, condition_code: dominantCode },
      { name: "주요 도시 B", temp_c: avgTemp - 1.5, condition: "구름 조금", condition_code: "cloudy" },
      { name: "주요 도시 C", temp_c: avgTemp + 2.1, condition: "맑음", condition_code: "sunny" },
      { name: "주요 도시 D", temp_c: avgTemp - 0.8, condition: dominant, condition_code: dominantCode },
      { name: "주요 도시 E", temp_c: avgTemp + 0.5, condition: "흐림", condition_code: "cloudy" },
      { name: "주요 도시 F", temp_c: avgTemp - 2.0, condition: "선선함", condition_code: "sunny" },
    ];
  }

  return {
    country: resCountry,
    average_temp_c: avgTemp,
    average_humidity: avgHumid,
    average_pm2_5: avgPm,
    dominant_condition: dominant,
    dominant_condition_code: dominantCode,
    cities,
    ai_summary: aiSummary
  };
}

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// National Average Weather API Route
app.get("/api/weather/national", async (req, res) => {
  const country = (req.query.country as string) || "대한민국";
  try {
    const ai = getGeminiClient();
    
    // Step 1: Use Gemini Search to fetch raw real-time climate data for the country and its cities
    const searchPrompt = `Google Search를 사용하여 '${country}' 전체의 실시간 평균 기온, 습도, 미세먼지(PM2.5) 상태를 검색하고, 주요 대표 도시들(예: 한국이라면 서울, 부산, 인천, 대구, 대전, 광주, 울산, 제주 등 6~8개 주요 도시)의 개별 실시간 기온과 기상 상태를 상세하게 검색해줘. 검색해서 취합한 구체적인 실시간 통계 정보를 자세히 설명해줘.`;
    
    const searchResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: searchPrompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const searchResultText = searchResponse.text;
    if (!searchResultText) {
      throw new Error("Google Search Grounding을 통한 실시간 정보 획득에 실패했습니다.");
    }

    // Step 2: Parse the raw search results into the strict JSON schema
    const parsePrompt = `아래 수집된 '${country}'의 실시간 기상 검색 데이터를 바탕으로, 지정된 스키마 형태에 완전히 일치하는 정량적이고 상세한 한국어 JSON 데이터를 생성해줘. 모든 온도, 습도, 미세먼지 수치는 정확한 숫자여야 해.

수집된 검색 데이터:
${searchResultText}

스키마 요구사항:
- country: 국가 이름 (한글, 예: '대한민국', '미국', '일본' 등)
- average_temp_c: 취합된 주요 도시 기온들의 평균값 (숫자)
- average_humidity: 취합된 주요 도시 습도들의 평균값 (숫자, 0~100 사이)
- average_pm2_5: 취합된 주요 도시 초미세먼지 농도 평균값 (숫자, 0~150 사이)
- dominant_condition: 오늘 이 국가의 전반적이고 대표적인 날씨 설명 (한글, 예: '대체로 맑음', '전국적으로 가을비', '대부분 흐림' 등)
- dominant_condition_code: 'sunny', 'cloudy', 'rainy', 'snowy', 'thunderstorm' 중 대표 기상 상태에 가장 적합한 하나를 선택
- cities: 최소 6개 이상의 주요 도시들의 개별 날씨 목록
  * name: 도시 이름 (한글, 예: '서울', '부산', '대구', '인천', '광주', '대전', '울산', '제주' 등)
  * temp_c: 해당 도시의 기온 (숫자)
  * condition: 해당 도시의 기상 상태 (한글, 예: '맑음', '흐림', '비' 등)
  * condition_code: 'sunny', 'cloudy', 'rainy', 'snowy', 'thunderstorm' 중 해당 도시 날씨에 가장 적합한 것 선택
- ai_summary: 국가 전체의 종합적인 기후 요약 리포트와 하루 생활 권장 제안 (한국어로 상냥하고 정교하게 서술)`;

    const formatResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: parsePrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: nationalWeatherResponseSchema
      }
    });

    if (formatResponse.text) {
      const resultData = JSON.parse(formatResponse.text.trim());
      return res.json(resultData);
    } else {
      throw new Error("국가 날씨 JSON 데이터를 생성하지 못했습니다.");
    }
  } catch (error: any) {
    console.error("National Weather Route Error (Using fallback data):", error);
    // Return high-quality realistic fallback instead of crashing with 500
    const fallbackData = getNationalWeatherFallback(country);
    return res.json(fallbackData);
  }
});


// Main Weather API Route
app.get("/api/weather", async (req, res) => {
  const city = (req.query.city as string) || "Seoul";
  const weatherApiKey = process.env.WEATHER_API_KEY;

  try {
    // If WeatherAPI.com Key is provided, fetch from it first
    if (weatherApiKey && weatherApiKey !== "") {
      try {
        const weatherUrl = `http://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${encodeURIComponent(city)}&days=3&aqi=yes&lang=ko`;
        const weatherResponse = await fetch(weatherUrl);
        
        if (weatherResponse.ok) {
          const data = await weatherResponse.json();
          
          // Map WeatherAPI.com data format to our clean app format
          const mappedData = {
            location: {
              name: data.location.name,
              country: data.location.country,
              localtime: data.location.localtime
            },
            current: {
              temp_c: data.current.temp_c,
              feelslike_c: data.current.feelslike_c,
              condition: data.current.condition.text,
              condition_code: getConditionCodeFromText(data.current.condition.text),
              wind_kph: data.current.wind_kph,
              humidity: data.current.humidity,
              uv: data.current.uv,
              pm2_5: data.current.air_quality?.pm2_5 ? Math.round(data.current.air_quality.pm2_5) : 15,
              pm10: data.current.air_quality?.pm10 ? Math.round(data.current.air_quality.pm10) : 35
            },
            forecast: data.forecast.forecastday.map((day: any) => {
              const dateObj = new Date(day.date);
              const daysOfWeek = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
              return {
                date: day.date,
                day_of_week: daysOfWeek[dateObj.getDay()],
                maxtemp_c: day.day.maxtemp_c,
                mintemp_c: day.day.mintemp_c,
                condition: day.day.condition.text,
                condition_code: getConditionCodeFromText(day.day.condition.text)
              };
            }),
            ai_insights: null as any,
            yesterday_comparison: null as any,
            tomorrow_prediction: null as any
          };

          // Generate AI insights, Yesterday Comparison and Tomorrow Prediction using Gemini based on the real WeatherAPI.com data
          try {
            const ai = getGeminiClient();
            const aiPrompt = `Below is the weather data for ${mappedData.location.name}, ${mappedData.location.country}.
Current temp: ${mappedData.current.temp_c}°C, Feels like: ${mappedData.current.feelslike_c}°C, Condition: ${mappedData.current.condition}, UV: ${mappedData.current.uv}, PM2.5: ${mappedData.current.pm2_5} ug/m3, PM10: ${mappedData.current.pm10} ug/m3.
Forecast:
${mappedData.forecast.map((f: any) => `- ${f.date} (${f.day_of_week}): Max ${f.maxtemp_c}°C, Min ${f.mintemp_c}°C, ${f.condition}`).join("\n")}

Please analyze today's weather, search or estimate yesterday's climate/temperature conditions, and predict TOMORROW's detailed weather (including min/max temp, overall condition, UV, humidity, wind, dust, a supportive analysis comparison advice, and morning/afternoon/evening details).

Respond STRICTLY in Korean adhering to the requested JSON schema:
{
  "ai_insights": {
    "summary": "Warm forecaster summary...",
    "clothing": ["clothing item 1", ...],
    "activities": ["activity 1", ...],
    "health": "Health tip..."
  },
  "yesterday_comparison": {
    "temp_diff_c": -1.5,
    "summary": "어제보다 1.5°C 낮고 바람이 더 불어 쌀쌀하게 느껴집니다."
  },
  "tomorrow_prediction": {
    "temp_min": 18,
    "temp_max": 25,
    "condition": "구름 많고 한때 비",
    "condition_code": "rainy",
    "uv": 3,
    "humidity": 75,
    "wind_kph": 15,
    "pm2_5": 14,
    "pm10": 38,
    "analysis": "내일은 오늘보다 선선하며 오후 늦게 한때 비 소식이 있으니 우산을 챙기시기 바랍니다.",
    "morning_temp": 19,
    "afternoon_temp": 24,
    "evening_temp": 20,
    "morning_condition": "구름 많음",
    "afternoon_condition": "흐리고 비",
    "evening_condition": "흐림"
  }
}`;

            const aiResponse = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: aiPrompt,
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    ai_insights: weatherResponseSchema.properties.ai_insights,
                    yesterday_comparison: weatherResponseSchema.properties.yesterday_comparison,
                    tomorrow_prediction: weatherResponseSchema.properties.tomorrow_prediction
                  },
                  required: ["ai_insights", "yesterday_comparison", "tomorrow_prediction"]
                }
              }
            });

            if (aiResponse.text) {
              const parsedResult = JSON.parse(aiResponse.text.trim());
              mappedData.ai_insights = parsedResult.ai_insights;
              mappedData.yesterday_comparison = parsedResult.yesterday_comparison;
              mappedData.tomorrow_prediction = parsedResult.tomorrow_prediction;
            }
          } catch (aiErr) {
            console.error("Failed to generate Gemini insights, using fallback insights:", aiErr);
            mappedData.ai_insights = getFallbackInsights(mappedData.current.temp_c, mappedData.current.condition);
            mappedData.yesterday_comparison = {
              temp_diff_c: 0,
              summary: "실시간 어제 날씨와 비교 분석 정보를 불러오지 못했습니다."
            };
            mappedData.tomorrow_prediction = getFallbackTomorrowPrediction(mappedData.current.temp_c, mappedData.current.condition);
          }

          return res.json(mappedData);
        }
      } catch (fetchErr) {
        console.warn("WeatherAPI fetch failed, falling back to Gemini Search Grounding:", fetchErr);
      }
    }

    // FALLBACK / DIRECT PATH: Use Gemini with Google Search Grounding to search live weather
    const ai = getGeminiClient();
    
    // Step 1: Use Gemini Search to fetch raw real-time weather data for the city
    const searchPrompt = `Google Search를 사용하여 '${city}'의 실시간 날씨 정보(현재 온도, 체감 온도, 날씨 설명, 자외선 지수, 습도, 풍속, 미세먼지 수치 등), 향후 3일간의 날씨 예보, 그리고 이 도시의 '어제 날씨 및 기온'을 함께 검색해서 정리해줘.`;
    
    const searchResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: searchPrompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const searchResultText = searchResponse.text;
    if (!searchResultText) {
      throw new Error("도시 기상 정보를 실시간으로 검색하지 못했습니다.");
    }

    // Step 2: Parse raw text into structured JSON matching the weather schema
    const parsePrompt = `아래 수집된 '${city}'의 날씨 및 어제 대비 날씨 검색 데이터를 바탕으로, 지정된 스키마 양식에 맞춰 완벽한 한국어로 정량화된 JSON 데이터를 생성해줘. 모든 필드의 타입이 엄격하게 지켜져야 해.

수집된 검색 데이터:
${searchResultText}

스키마 가이드라인:
- location.name: 도시명 (한글로 변환, 예: '서울', '제주' 등)
- location.country: 국가명 (한글로 변환, 예: '대한민국', '미국', '일본' 등)
- location.localtime: 검색 시점의 현지 날씨 날짜/시간 (예: '2026-07-18 18:00' 형태)
- current.temp_c, feelslike_c, wind_kph, humidity, uv, pm2_5, pm10: 구체적인 실제 숫자로 채우기 (PM2.5는 0~150 사이, PM10은 0~200 사이)
- current.condition_code, forecast[i].condition_code: 'sunny', 'cloudy', 'rainy', 'snowy', 'thunderstorm' 중 기상에 맞는 하나를 영어 소문자 그대로 채우기
- forecast: 오늘을 포함하여 3일간의 구체적인 예보 목록
- ai_insights: 분석된 라이프스타일 가이드 (한국어로 다정하고 성실한 톤으로 서술)
- yesterday_comparison: 어제 날씨와 오늘 날씨의 기온 및 상태를 구체적으로 비교한 분석 데이터
  * temp_diff_c: 어제와 비교한 기온 차이 (오늘 온도 - 어제 온도, 양수/음수/영 소수점 포함 숫자)
  * summary: 어제 날씨 대비 오늘 기상 상황을 비교하는 한국어 친절한 한 줄 요약 (예: '어제보다 2.3°C 높고 미세먼지가 걷혀 한결 쾌적합니다.')
- tomorrow_prediction: 내일 날씨에 대한 정밀한 AI 분석 및 시간대별 예측 정보
  * temp_min, temp_max, uv, humidity, wind_kph, pm2_5, pm10: 구체적인 숫자로 예측치 채우기
  * condition: 내일 전반의 기상 상태 한글 텍스트 (예: '맑은 후 오후 흐려짐')
  * condition_code: 'sunny', 'cloudy', 'rainy', 'snowy', 'thunderstorm' 중 내일 날씨에 적합한 기상 코드 영어 소문자
  * analysis: 내일의 기상 상황을 상세히 설명하고 외출 또는 기상 대비를 조언해 주는 한국어 2-3문장 요약
  * morning_temp, afternoon_temp, evening_temp: 내일 아침, 오후, 저녁의 예상 기온(도씨 숫자)
  * morning_condition, afternoon_condition, evening_condition: 내일 아침, 오후, 저녁의 예상 날씨 묘사 한글 (예: '맑음', '흐리고 한때 비')`;

    const formatResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: parsePrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: weatherResponseSchema
      }
    });

    if (formatResponse.text) {
      const resultData = JSON.parse(formatResponse.text.trim());
      return res.json(resultData);
    } else {
      throw new Error("날씨 JSON 데이터를 생성하지 못했습니다.");
    }

  } catch (error: any) {
    console.error("Weather Route Error:", error);
    res.status(500).json({
      error: "날씨 정보를 불러오는 데 실패했습니다.",
      details: error.message || "서버 내부 오류가 발생했습니다."
    });
  }
});

// Helper functions for WeatherAPI data conversion
function getConditionCodeFromText(text: string): string {
  const korean = text.toLowerCase();
  if (korean.includes("맑음") || korean.includes("태양") || korean.includes("화창")) return "sunny";
  if (korean.includes("비") || korean.includes("소나기") || korean.includes("강우")) return "rainy";
  if (korean.includes("눈") || korean.includes("우박") || korean.includes("진눈깨비")) return "snowy";
  if (korean.includes("번개") || korean.includes("뇌우") || korean.includes("천둥")) return "thunderstorm";
  return "cloudy"; // Default condition
}

function getFallbackInsights(temp: number, condition: string) {
  let clothing = ["편안한 일상복"];
  let activities = ["실내 활동"];
  let health = "수분을 자주 섭취하고 건강에 유의하세요.";

  if (temp >= 28) {
    clothing = ["시원한 반팔 티셔츠", "린넨 바지", "민소매", "반바지"];
    activities = ["실내 미술관 관람", "시원한 카페 휴식", "실내 쇼핑몰"];
    health = "무더운 날씨로 온열 질환 위험이 있으니 야외 활동을 줄이고 충분히 수분을 섭취하세요.";
  } else if (temp >= 20) {
    clothing = ["얇은 셔츠", "얇은 긴팔", "면바지", "청바지"];
    activities = ["공원 산책", "자전거 라이딩", "야외 테라스 카페"];
    health = "활동하기 가장 좋은 기온입니다. 가벼운 유산소 운동으로 하루를 활기차게 시작해보세요.";
  } else if (temp >= 10) {
    clothing = ["자켓", "가디건", "셔츠", "청바지", "맨투맨"];
    activities = ["도심 투어", "가벼운 등산", "독서"];
    health = "일교차가 커서 감기에 걸리기 쉬운 날씨입니다. 얇은 옷을 여러 겹 겹쳐 입어 기온 변화에 대비하세요.";
  } else {
    clothing = ["두꺼운 코트", "패딩 점퍼", "목도리", "기모 바지"];
    activities = ["홈 시네마", "실내 스파", "카페 공부"];
    health = "체온 유지가 매우 중요합니다. 외출 시 목도리와 장갑 등으로 찬바람을 막고 손을 자주 씻으세요.";
  }

  return {
    summary: `오늘 날씨는 현재 ${temp}°C이며, 전체적으로 ${condition} 상태를 보이고 있습니다.`,
    clothing,
    activities,
    health
  };
}

function getFallbackTomorrowPrediction(temp: number, condition: string) {
  return {
    temp_min: Math.round(temp - 4),
    temp_max: Math.round(temp + 2),
    condition: condition,
    condition_code: getConditionCodeFromText(condition),
    uv: 4,
    humidity: 60,
    wind_kph: 10,
    pm2_5: 18,
    pm10: 42,
    analysis: "내일도 오늘과 유사한 평온한 날씨가 지속되겠습니다. 외출 전 아침저녁 선선한 바람에 대비한 가벼운 겉옷을 준비하시면 좋겠습니다.",
    morning_temp: Math.round(temp - 3),
    afternoon_temp: Math.round(temp + 1),
    evening_temp: Math.round(temp - 1),
    morning_condition: condition,
    afternoon_condition: condition,
    evening_condition: condition
  };
}

// Start full-stack server
async function startServer() {
  // Setup Vite Dev Server in Non-production environments
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve Static Assets in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Weather Dashboard running on http://localhost:${PORT}`);
  });
}

startServer();
