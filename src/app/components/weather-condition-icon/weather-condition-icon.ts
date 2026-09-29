import { Component, computed, input } from '@angular/core';
import { getWeatherConditionKind } from '../../utils/weather-condition';

@Component({
  selector: 'app-weather-condition-icon',
  templateUrl: './weather-condition-icon.html',
  styleUrl: './weather-condition-icon.scss',
})
export class WeatherConditionIcon {
  readonly weatherId = input.required<number | null>();
  readonly isNight = input.required<boolean>();

  readonly imagePath = computed(() => {
    const kind = getWeatherConditionKind(this.weatherId());
    if (!kind) return null;

    const image = kind === 'clear' && this.isNight() ? 'clear-night' : kind;

    return new URL(`image/weather/${image}-min.webp`, document.baseURI).toString();
  });
}
