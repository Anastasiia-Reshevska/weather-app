import { Component } from '@angular/core';
import { WeatherWrapper } from '../../components/weather-wrapper/weather-wrapper';

@Component({
  selector: 'app-home-page',
  imports: [WeatherWrapper],
  templateUrl: './home-page.html',
})
export class HomePage {}
