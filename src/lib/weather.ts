export type WeatherResult = {
  modifier: number;
  condition: string;
};

export async function getWeatherModifier(lat: number, lng: number): Promise<WeatherResult> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return { modifier: 1.0, condition: "unknown" };
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);

    if (!res.ok) {
      return { modifier: 1.0, condition: "unknown" };
    }

    const data = await res.json();
    const main: string = data.weather?.[0]?.main ?? "Clear";
    const windSpeed: number = data.wind?.speed ?? 0;

    let modifier = 1.0;
    switch (main) {
      case "Thunderstorm":
        modifier = 0.6;
        break;
      case "Rain":
      case "Drizzle":
        modifier = 0.7;
        break;
      case "Snow":
        modifier = 0.6;
        break;
      case "Mist":
      case "Fog":
      case "Haze":
        modifier = 0.85;
        break;
      case "Clear":
        modifier = 1.1;
        break;
      default:
        modifier = 1.0;
    }

    // 바람이 강하면(10m/s 이상) 추가로 속도 감소
    if (windSpeed > 10) modifier *= 0.85;

    modifier = Math.min(1.3, Math.max(0.5, modifier));

    return { modifier, condition: main };
  } catch {
    // 날씨 API 실패 시: 기본 속도(보정 없음)로 계산
    return { modifier: 1.0, condition: "unknown" };
  }
}

export function midpoint(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): { lat: number; lng: number } {
  return { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 };
}
