import { Injectable } from '@angular/core';
import axios from 'axios';
import type { CityOption } from './city-types';
import type { CurrentWeather } from './weather-types';

const REQUEST_TIMEOUT_MS = 10_000;

interface PhotonResponse {
  features: Array<{
    properties: {
      osm_id: number;
      osm_type: string;
      name?: string;
      state?: string;
      country?: string;
    };
    geometry: { coordinates: [number, number] };
  }>;
}

interface WeatherResponse {
  weather: Array<{ description: string }>;
  main: {
    temp: number;
    humidity: number;
  };
  wind: { speed: number };
}

interface ApiConfig {
  apiKey: string;
  geocodingUrl: string;
  weatherUrl: string;
}

@Injectable({ providedIn: 'root' })
export class ApiRequestsService {
  private config?: Promise<ApiConfig>;

  isInvalidApiKey(error: unknown): boolean {
    return this.hasStatus(error, 401);
  }

  isRateLimitExceeded(error: unknown): boolean {
    return this.hasStatus(error, 429);
  }

  private hasStatus(error: unknown, status: number): boolean {
    return axios.isAxiosError(error) && error.response?.status === status;
  }

  private getConfig(): Promise<ApiConfig> {
    this.config ??= axios
      .get<ApiConfig>(new URL('weather-config.json', document.baseURI).toString(), {
        timeout: REQUEST_TIMEOUT_MS,
      })
      .then(({ data }) => {
        if (!data || ![data.apiKey, data.geocodingUrl, data.weatherUrl]
          .every((value) => typeof value === 'string' && value.trim())) {
          throw new Error('API configuration is incomplete.');
        }
        return data;
      })
      .catch((error: unknown) => {
        this.config = undefined;
        throw error;
      });

    return this.config;
  }

  async searchCities(query: string, signal?: AbortSignal): Promise<CityOption[]> {
    const { geocodingUrl } = await this.getConfig();
    const { data } = await axios.get<PhotonResponse>(
      geocodingUrl,
      {
        signal,
        timeout: REQUEST_TIMEOUT_MS,
        params: {
          q: query.trim(),
          layer: 'city',
          limit: 5,
          lang: 'en',
        },
      },
    );

    const cities: CityOption[] = [];
    for (const { properties, geometry } of data.features) {
      const name = properties.name?.trim();
      if (!name) continue;

      const details = [...new Set([properties.state, properties.country])]
        .filter((part) => part && part !== name)
        .join(', ');

      cities.push({
        id: `${properties.osm_type}-${properties.osm_id}`,
        name,
        details,
        label: details ? `${name}, ${details}` : name,
        latitude: geometry.coordinates[1],
        longitude: geometry.coordinates[0],
      });
    }

    return cities;
  }

  async getCurrentWeather(city: CityOption): Promise<CurrentWeather> {
    const { apiKey, weatherUrl } = await this.getConfig();
    const { data: current } = await axios.get<WeatherResponse>(
      weatherUrl,
      {
        timeout: REQUEST_TIMEOUT_MS,
        params: {
          lat: city.latitude,
          lon: city.longitude,
          appid: apiKey,
          units: 'metric',
        },
      },
    );
    const description = current.weather[0]?.description ?? 'Unknown conditions';

    return {
      location: city.label,
      temperature: Math.round(current.main.temp),
      condition: description.charAt(0).toUpperCase() + description.slice(1),
      humidity: Math.round(current.main.humidity),
      windSpeed: Math.round(current.wind.speed * 3.6),
    };
  }
}
