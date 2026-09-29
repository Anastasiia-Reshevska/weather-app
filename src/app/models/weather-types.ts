export interface CurrentWeather {
  location: string;
  temperature: number;
  condition: string;
  weatherId: number | null;
  isNight: boolean;
  humidity: number;
  windSpeed: number;
}
