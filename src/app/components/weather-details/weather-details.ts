import { Component, computed, input } from '@angular/core';
import type { CurrentWeather } from '../../models/weather-types';
import { getWeatherConditionKind } from '../../utils/weather-condition';
import { WeatherConditionIcon } from '../weather-condition-icon/weather-condition-icon';

@Component({
  selector: 'app-weather-details',
  imports: [WeatherConditionIcon],
  templateUrl: './weather-details.html',
  styleUrl: './weather-details.scss',
})
export class WeatherDetails {
  readonly weather = input<CurrentWeather | null>(null);

  readonly resultClass = computed(() => {
    const weather = this.weather();
    if (!weather) return 'weather__result';

    const kind = getWeatherConditionKind(weather.weatherId);
    if (!kind) return 'weather__result';

    const theme = kind === 'clear' && weather.isNight ? 'clear-night' : kind;
    return `weather__result weather__result--${theme}`;
  });
}
