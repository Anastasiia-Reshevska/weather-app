export type WeatherConditionKind =
  | 'thunderstorm'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'mist'
  | 'clear'
  | 'clouds'
  | 'tornado';

const MIST_WEATHER_IDS = new Set([701, 711, 721, 731, 741, 751, 761, 762]);

export function getWeatherConditionKind(id: number | null): WeatherConditionKind | null {
  if (id === null) return null;
  if (id >= 200 && id < 300) return 'thunderstorm';
  if (id >= 300 && id < 400) return 'drizzle';
  if (id === 511 || (id >= 600 && id < 700)) return 'snow';
  if (id >= 500 && id < 600) return 'rain';
  if (id === 781) return 'tornado';
  if (MIST_WEATHER_IDS.has(id)) return 'mist';
  if (id === 800) return 'clear';
  if (id >= 801 && id <= 804) return 'clouds';
  return null;
}
