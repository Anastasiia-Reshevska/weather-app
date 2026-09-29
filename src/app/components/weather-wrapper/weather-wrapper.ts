import { Component, signal } from '@angular/core';
import { WeatherError } from '../weather-error/weather-error';
import { WeatherForm } from '../weather-form/weather-form';
import type { CurrentWeather } from '../../models/weather-types';
import { WeatherSearch } from '../weather-details/weather-details';

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
