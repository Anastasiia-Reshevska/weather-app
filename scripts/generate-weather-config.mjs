import { writeFile } from 'node:fs/promises';

const key = process.env.OPENWEATHER_API_KEY?.trim();
const geocodingUrl = process.env.GEOCODING_API_URL?.trim();
const weatherUrl = process.env.OPENWEATHER_API_URL?.trim();

const errors = [];

if (!key || key === 'your_openweathermap_api_key') {
  errors.push('Set OPENWEATHER_API_KEY in .env to your OpenWeatherMap API key.');
}

for (const [name, value] of [
  ['GEOCODING_API_URL', geocodingUrl],
  ['OPENWEATHER_API_URL', weatherUrl],
]) {
  if (!value) {
    errors.push(`Set ${name} in .env to an HTTPS URL.`);
    continue;
  }

  try {
    if (new URL(value).protocol !== 'https:') {
      errors.push(`${name} in .env must use HTTPS.`);
    }
  } catch {
    errors.push(`${name} in .env must be a valid HTTPS URL.`);
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else {

  await writeFile(
    new URL('../public/weather-config.json', import.meta.url),
    `${JSON.stringify({ apiKey: key, geocodingUrl, weatherUrl })}\n`,
    { mode: 0o600 },
  );
}
