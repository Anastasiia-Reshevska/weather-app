import { Component, signal } from '@angular/core';
import { WeatherError } from '../weather-error/weather-error';
import { WeatherForm } from '../weather-form/weather-form';
import type { CurrentWeather } from '../../services/weather-types';
import { WeatherSearch } from '../weather-search/weather-search';

@Component({
  selector: 'app-weather-wrapper',
  imports: [WeatherError, WeatherForm, WeatherSearch],
  templateUrl: './weather-wrapper.html',
  styleUrl: './weather-wrapper.scss',
})
export class WeatherWrapper {
  readonly weather = signal<CurrentWeather | null>(null);
  readonly errorMessage = signal('');
}
