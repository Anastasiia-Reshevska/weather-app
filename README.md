# Weather App

A web application for retrieving and displaying weather forecasts. The project was built using Angular.

## Functionality

- Search for weather by city name using a public weather API.
- Display of current temperature, weather conditions, humidity, and wind speed.
- Interface styling based on weather conditions: sunny, rainy, or snowy.
- Caching of results for each city for 10 minutes to avoid repeated API requests.


## Local launch

Node.js and npm are required. Run the following in the project root:

```bash
npm ci
cp .env.example .env
npm start
```

Set `OPENWEATHER_API_KEY` in `.env` to your OpenWeatherMap key before starting the app. `.env` and the generated `public/weather-config.json`.

## Audit

```bash
npm run build
```

To automatically fix the order of SCSS properties, run:

```bash
npm run lint:styles:fix
```

The ready-to-use build is stored in `dist/weather-app/`.
