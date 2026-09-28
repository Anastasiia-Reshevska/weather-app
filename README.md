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
npm start
```


## Audit

```bash
npm test -- --watch=false
npm run build
```

The ready-to-use build is stored in `dist/weather-app/`.
