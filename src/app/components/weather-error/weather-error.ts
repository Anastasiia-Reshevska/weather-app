import { Component, input } from '@angular/core';

@Component({
  selector: 'app-weather-error',
  templateUrl: './weather-error.html',
  styleUrl: './weather-error.scss',
})
export class WeatherError {
  readonly message = input('');
}
