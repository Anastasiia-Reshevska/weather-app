import { Component, inject, OnDestroy, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WeatherSubmitButton } from '../weather-submit-button/weather-submit-button';
import { WeatherRepository } from '../../services/weather-repository';
import type { CityOption } from '../../services/city-types';
import type { CurrentWeather } from '../../services/weather-types';

const MIN_CITY_QUERY_LENGTH = 3;
const CITY_SEARCH_DELAY_MS = 2000;

@Component({
  selector: 'app-weather-form',
  imports: [FormsModule, WeatherSubmitButton],
  templateUrl: './weather-form.html',
  styleUrl: './weather-form.scss',
})
export class WeatherForm implements OnDestroy {
  private readonly weatherRepository = inject(WeatherRepository);
  private searchTimer?: ReturnType<typeof setTimeout>;
  private searchAbort?: AbortController;
  private searchVersion = 0;

  cityQuery = '';
  readonly cities = signal<CityOption[]>([]);
  readonly selectedCity = signal<CityOption | null>(null);
  readonly weatherChange = output<CurrentWeather | null>();
  readonly errorChange = output<string>();
  readonly isSearchingCities = signal(false);
  readonly isLoadingWeather = signal(false);
  readonly citySearchMessage = signal('');

  ngOnDestroy(): void {
    this.cancelCitySearch();
  }

  private cancelCitySearch(): void {
    this.searchVersion += 1;
    clearTimeout(this.searchTimer);
    this.searchAbort?.abort();
    this.searchAbort = undefined;
    this.isSearchingCities.set(false);
  }

  onQueryChange(value: string): void {
    this.cancelCitySearch();

    this.cityQuery = value;
    this.cities.set([]);
    this.selectedCity.set(null);
    this.weatherChange.emit(null);
    this.citySearchMessage.set('');
    this.errorChange.emit('');

    const query = value.trim();
    if (query.length < MIN_CITY_QUERY_LENGTH) return;

    const version = this.searchVersion;
    this.searchTimer = setTimeout(() => void this.findCities(query, version), CITY_SEARCH_DELAY_MS);
  }

  private async findCities(query: string, version: number): Promise<void> {
    if (version !== this.searchVersion) return;

    const abort = new AbortController();
    this.searchAbort = abort;
    this.isSearchingCities.set(true);
    this.citySearchMessage.set('');

    try {
      const cities = await this.weatherRepository.searchCities(query, abort.signal);
      if (version !== this.searchVersion) return;

      this.cities.set(cities);

      if (cities.length === 0) {
        this.citySearchMessage.set('No cities found. Check the name and try again.');
      }
    } catch (error) {
      if (version !== this.searchVersion || abort.signal.aborted) return;

      this.citySearchMessage.set(
        this.weatherRepository.isRateLimitExceeded(error)
          ? 'City search is busy. Please try again in a moment.'
          : 'Could not find cities. Please try again later.',
      );
    } finally {
      if (version === this.searchVersion) {
        this.isSearchingCities.set(false);
        this.searchAbort = undefined;
      }
    }
  }

  selectCity(city: CityOption): void {
    this.cancelCitySearch();
    this.cityQuery = city.label;
    this.selectedCity.set(city);
    this.cities.set([]);
    this.citySearchMessage.set('');
    this.errorChange.emit('');
    this.weatherChange.emit(null);
  }

  async showWeather(): Promise<void> {
    const city = this.selectedCity();
    if (!city || this.isLoadingWeather()) return;

    this.isLoadingWeather.set(true);
    this.errorChange.emit('');
    this.weatherChange.emit(null);

    try {
      this.weatherChange.emit(await this.weatherRepository.getCurrentWeather(city));
    } catch (error) {
      if (this.weatherRepository.isRateLimitExceeded(error)) {
        this.errorChange.emit('Weather request limit reached. Please try again later.');
      } else if (this.weatherRepository.isInvalidApiKey(error)) {
        this.errorChange.emit('OpenWeatherMap API key is invalid or not active yet.');
      } else {
        this.errorChange.emit('Could not load the weather. Please try again later.');
      }
    } finally {
      this.isLoadingWeather.set(false);
    }
  }
}
