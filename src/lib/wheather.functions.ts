import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_API = "https://api.open-meteo.com/v1/forecast";

const geocodingResultSchema = z.object({
  results: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        country: z.string(),
        admin1: z.string().optional(),
      }),
    )
    .optional(),
});

const forecastSchema = z.object({
  current: z.object({
    time: z.string(),
    interval: z.number(),
    temperature_2m: z.number(),
    relative_humidity_2m: z.number(),
    apparent_temperature: z.number(),
    is_day: z.number(),
    precipitation: z.number(),
    weather_code: z.number(),
    wind_speed_10m: z.number(),
  }),
  daily: z.object({
    time: z.array(z.string()),
    weather_code: z.array(z.number()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    precipitation_sum: z.array(z.number()),
  }),
});

export type WeatherLocation = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string | undefined;
};

export type CurrentWeather = {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  isDay: boolean;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
};

export type DailyForecast = {
  time: string;
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
};

export type WeatherData = {
  location: WeatherLocation;
  current: CurrentWeather;
  daily: DailyForecast[];
};

export function getWeatherDescription(code: number): string {
  const codes: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return codes[code] ?? "Unknown";
}

export const searchLocations = createServerFn({ method: "GET" })
  .inputValidator((input: { query: string }) => {
    return z.object({ query: z.string().min(1).max(100) }).parse(input);
  })
  .handler(async ({ data }) => {
    const url = new URL(GEOCODING_API);
    url.searchParams.set("name", data.query);
    url.searchParams.set("count", "5");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(Geocoding request failed: ${response.status});
    }

    const json = await response.json();
    const parsed = geocodingResultSchema.parse(json);
    return (parsed.results ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      country: r.country,
      admin1: r.admin1,
    }));
  });

export const getWeather = createServerFn({ method: "GET" })
  .inputValidator(
    (input: {
      latitude: number;
      longitude: number;
      name: string;
      country: string;
      admin1?: string | undefined;
    }) => {
      return z
        .object({
          latitude: z.number(), longitude: z.number(),
          name: z.string(),
          country: z.string(),
          admin1: z.string().optional().or(z.undefined()),
        })
        .parse(input);
    },
  )
  .handler(async ({ data }) => {
    const url = new URL(FORECAST_API);
    url.searchParams.set("latitude", data.latitude.toString());
    url.searchParams.set("longitude", data.longitude.toString());
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
    );
    url.searchParams.set(
      "daily",
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum",
    );
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "7");

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(Forecast request failed: ${response.status});
    }

    const json = await response.json();
    const parsed = forecastSchema.parse(json);

    const daily: DailyForecast[] = parsed.daily.time.map((time, index) => ({
      time,
      weatherCode: parsed.daily.weather_code[index]!,
      maxTemp: parsed.daily.temperature_2m_max[index]!,
      minTemp: parsed.daily.temperature_2m_min[index]!,
      precipitation: parsed.daily.precipitation_sum[index]!,
    }));

    const location: WeatherLocation = {
      id: 0,
      name: data.name,
      latitude: data.latitude,
      longitude: data.longitude,
      country: data.country,
    };
    if (data.admin1) {
      location.admin1 = data.admin1;
    }

    return {
      location,
      current: {
        time: parsed.current.time,
        temperature: parsed.current.temperature_2m,
        apparentTemperature: parsed.current.apparent_temperature,
        humidity: parsed.current.relative_humidity_2m,
        isDay: parsed.current.is_day === 1,
        precipitation: parsed.current.precipitation,
        weatherCode: parsed.current.weather_code,
        windSpeed: parsed.current.wind_speed_10m,
      },
      daily,
    } satisfies WeatherData;
  });
