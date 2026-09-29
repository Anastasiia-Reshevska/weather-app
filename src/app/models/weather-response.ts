export interface WeatherResponse {
  weather: Array<{ id: number; description: string; icon: string }>;
  main: {
    temp: number;
    humidity: number;
  };
  wind: { speed: number };
}
