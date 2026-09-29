import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-weather-submit-button',
  templateUrl: './weather-submit-button.html',
  styleUrl: './weather-submit-button.scss',
})
export class WeatherSubmitButton {
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly clicked = output<void>();
}
