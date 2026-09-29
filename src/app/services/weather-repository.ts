import { inject, Injectable } from '@angular/core';
import { ApiRequestsService } from './api-requests';
import { CacheService } from './cache';
import type { CityOption } from '../models/city-types';
import type { CurrentWeather } from '../models/weather-types';

@Injectable({ providedIn: 'root' })
export class WeatherRepository {
  private readonly requests = inject(ApiRequestsService);
  private readonly cache = inject(CacheService);

  isInvalidApiKey(error: unknown): boolean {
    return this.requests.isInvalidApiKey(error);
  }

  isRateLimitExceeded(error: unknown): boolean {
    return this.requests.isRateLimitExceeded(error);
  }

  async searchCities(query: string, signal?: AbortSignal): Promise<CityOption[]> {
    const cached = this.cache.getCities(query);
    if (cached !== undefined) return cached;

    const cities = await this.requests.searchCities(query, signal);
    this.cache.setCities(query, cities);
    return cities;
  }

  async getCurrentWeather(city: CityOption): Promise<CurrentWeather> {
    const cached = this.cache.getWeather(city);
    if (cached !== undefined) return { ...cached, location: city.label };

    const weather = await this.requests.getCurrentWeather(city);
    this.cache.setWeather(city, weather);
    return weather;
  }
}
