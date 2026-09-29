import { Component, input } from '@angular/core';
import type { CurrentWeather } from '../../services/weather-types';

@Component({
  selector: 'app-weather-search',
  templateUrl: './weather-search.html',
  styleUrl: './weather-search.scss',
})
export class WeatherSearch {
  readonly weather = input<CurrentWeather | null>(null);
}
