import { Injectable, OnDestroy } from '@angular/core';
import type { CityOption } from './city-types';
import type { CurrentWeather } from './weather-types';

const CACHE_TTL_MS = 10 * 60 * 1000;
const CITY_CACHE_KEY = 'weather-app:city-cache:v1';
const WEATHER_CACHE_KEY = 'weather-app:weather-cache:v1';

interface CacheEntry<T> {
  data: T;
  savedAt: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCityOption(value: unknown): value is CityOption {
  return isRecord(value)
    && typeof value['id'] === 'string'
    && typeof value['name'] === 'string'
    && typeof value['details'] === 'string'
    && typeof value['label'] === 'string'
    && typeof value['latitude'] === 'number'
    && typeof value['longitude'] === 'number';
}

function isCurrentWeather(value: unknown): value is CurrentWeather {
  return isRecord(value)
    && typeof value['location'] === 'string'
    && typeof value['temperature'] === 'number'
    && typeof value['condition'] === 'string'
    && typeof value['humidity'] === 'number'
    && typeof value['windSpeed'] === 'number';
}

@Injectable({ providedIn: 'root' })
export class CacheService implements OnDestroy {
  private readonly cityCache = this.loadCache(
    CITY_CACHE_KEY,
    (value): value is CityOption[] => Array.isArray(value) && value.every(isCityOption),
  );
  private readonly weatherCache = this.loadCache(WEATHER_CACHE_KEY, isCurrentWeather);
  private cleanupTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.scheduleCleanup();
  }

  ngOnDestroy(): void {
    clearTimeout(this.cleanupTimer);
  }

  getCities(query: string): CityOption[] | undefined {
    return this.getCached(CITY_CACHE_KEY, this.cityCache, query.trim().toLocaleLowerCase());
  }

  setCities(query: string, cities: CityOption[]): void {
    this.setCached(CITY_CACHE_KEY, this.cityCache, query.trim().toLocaleLowerCase(), cities);
  }

  getWeather(city: CityOption): CurrentWeather | undefined {
    return this.getCached(WEATHER_CACHE_KEY, this.weatherCache, this.weatherKey(city));
  }

  setWeather(city: CityOption, weather: CurrentWeather): void {
    this.setCached(WEATHER_CACHE_KEY, this.weatherCache, this.weatherKey(city), weather);
  }

  private weatherKey(city: CityOption): string {
    return `${city.latitude},${city.longitude}`;
  }

  private loadCache<T>(key: string, isData: (value: unknown) => value is T): Map<string, CacheEntry<T>> {
    let parsed: unknown;
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return new Map();
      parsed = JSON.parse(stored);
    } catch (error) {
      console.error(`Failed to load cache "${key}":`, error);
      this.removeStoredCache(key);
      return new Map();
    }

    if (!Array.isArray(parsed)) {
      this.removeStoredCache(key);
      return new Map();
    }

    const entries: Array<[string, CacheEntry<T>]> = [];
    const now = Date.now();
    for (const item of parsed) {
      if (!Array.isArray(item) || typeof item[0] !== 'string' || !isRecord(item[1])) continue;

      const { data, savedAt } = item[1];
      if (typeof savedAt !== 'number' || !Number.isFinite(savedAt)
        || savedAt > now || now - savedAt >= CACHE_TTL_MS || !isData(data)) continue;

      entries.push([item[0], { data, savedAt }]);
    }

    const cache = new Map(entries);
    if (entries.length !== parsed.length) this.saveCache(key, cache);
    return cache;
  }

  private saveCache<T>(key: string, cache: Map<string, CacheEntry<T>>): void {
    const now = Date.now();
    for (const [cacheKey, entry] of cache) {
      if (now - entry.savedAt >= CACHE_TTL_MS) cache.delete(cacheKey);
    }

    const serialized = cache.size > 0 ? JSON.stringify([...cache]) : null;
    try {
      if (serialized === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, serialized);
      }
    } catch (error) {
      console.error(`Failed to save cache "${key}" to localStorage:`, error);
    }
  }

  private removeStoredCache(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove cache "${key}" from localStorage:`, error);
    }
  }

  private getCached<T>(key: string, cache: Map<string, CacheEntry<T>>, itemKey: string): T | undefined {
    const entry = cache.get(itemKey);
    if (!entry) return undefined;

    if (Date.now() - entry.savedAt < CACHE_TTL_MS) return entry.data;

    cache.delete(itemKey);
    this.saveCache(key, cache);
    this.scheduleCleanup();
    return undefined;
  }

  private setCached<T>(key: string, cache: Map<string, CacheEntry<T>>, itemKey: string, data: T): void {
    cache.set(itemKey, { data, savedAt: Date.now() });
    this.saveCache(key, cache);
    this.scheduleCleanup();
  }

  private scheduleCleanup(): void {
    clearTimeout(this.cleanupTimer);

    const expiresAt = [...this.cityCache.values(), ...this.weatherCache.values()]
      .reduce((next, entry) => Math.min(next, entry.savedAt + CACHE_TTL_MS), Infinity);
    if (expiresAt === Infinity) return;

    this.cleanupTimer = setTimeout(() => {
      this.saveCache(CITY_CACHE_KEY, this.cityCache);
      this.saveCache(WEATHER_CACHE_KEY, this.weatherCache);
      this.scheduleCleanup();
    }, Math.max(0, expiresAt - Date.now()));
  }
}
