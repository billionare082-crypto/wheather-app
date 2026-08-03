import { createFileRoute, HeadContent } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Search, MapPin, Wind, Droplets, Thermometer, CloudRain } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { WeatherIcon } from "@/components/weather/weather-icon";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  getWeather,
  getWeatherDescription,
  searchLocations,
  type WeatherData,
  type WeatherLocation,
} from "@/lib/weather.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Weather | Simple Forecast" },
      { name: "description", content: "Check current weather and 7-day forecasts for any city." },
      { property: "og:title", content: "Weather | Simple Forecast" },
      { property: "og:description", content: "Check current weather and 7-day forecasts for any city." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WeatherApp,
});

const DEFAULT_LOCATION: WeatherLocation = {
  id: 0,
  name: "New York",
  latitude: 40.7128,
  longitude: -74.006,
  country: "United States",
  admin1: "New York",
};

function WeatherApp() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<WeatherLocation[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useServerFn(getWeather);
  const fetchLocations = useServerFn(searchLocations);

  const loadWeather = async (location: WeatherLocation) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather({ data: location });
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load weather");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(DEFAULT_LOCATION);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const results = await fetchLocations({ data: { query: query.trim() } });
        setSuggestions(results);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      const first = suggestions[0];
      if (first) selectLocation(first);
    }
  };

  const selectLocation = (location: WeatherLocation) => {
    setQuery(location.name);
    setShowSuggestions(false);
    setSuggestions([]);
    loadWeather(location);
  };

  const locationLabel = useMemo(() => {
    if (!weather) return "";
    const parts = [weather.location.name];
    if (weather.location.admin1) parts.push(weather.location.admin1);
    parts.push(weather.location.country);
    return parts.join(", ");
  }, [weather]);

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      <HeadContent />
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Weather
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Current conditions and 7-day forecast
            </p>
          </div>
          <ThemeToggle />
        </header> <form onSubmit={handleSearch} className="relative mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="Search for a city..."
                className="pl-9"
                aria-label="Search for a city"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
                  <ul className="py-1">
                    {suggestions.map((location) => (
                      <li key={location.id}>
                        <button
                          type="button"
                          onClick={() => selectLocation(location)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>
                            {location.name}
                            {location.admin1 && , ${location.admin1}}, {location.country}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Search"}
            </Button>
          </div>
        </form>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {weather && !loading && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center gap-2 md:justify-start">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <h2 className="text-lg font-medium text-foreground">{locationLabel}</h2>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {format(new Date(weather.current.time), "EEEE, MMMM d, h:mm a")}
                    </p>
                    <p className="mt-4 text-5xl font-semibold tracking-tight text-foreground md:text-6xl">
                      {Math.round(weather.current.temperature)}°
                    </p>
                    <p className="mt-1 text-lg text-muted-foreground">
                      {getWeatherDescription(weather.current.weatherCode)}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <WeatherIcon
                      code={weather.current.weatherCode}
                      isDay={weather.current.isDay}
                      className="h-32 w-32 md:h-40 md:w-40"
                    />
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <MetricCard
                    icon={<Thermometer className="h-4 w-4" />}
                    label="Feels like"
                    value={${Math.round(weather.current.apparentTemperature)}°} />
                  <MetricCard
                    icon={<Droplets className="h-4 w-4" />}
                    label="Humidity"
                    value={${weather.current.humidity}%}
                  />
                  <MetricCard
                    icon={<Wind className="h-4 w-4" />}
                    label="Wind"
                    value={${Math.round(weather.current.windSpeed)} km/h}
                  />
                  <MetricCard
                    icon={<CloudRain className="h-4 w-4" />}
                    label="Precipitation"
                    value={${weather.current.precipitation} mm}
                  />
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="mb-4 text-lg font-medium text-foreground">7-Day Forecast</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {weather.daily.map((day) => (
                  <Card key={day.time}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="min-w-[4.5rem]">
                        <p className="text-sm font-medium text-foreground">
                          {format(new Date(day.time), "EEE, MMM d")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getWeatherDescription(day.weatherCode)}
                        </p>
                      </div>
                      <WeatherIcon code={day.weatherCode} isDay className="h-10 w-10" />
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {day.precipitation > 0 ? ${day.precipitation} mm : "No rain"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {!weather && loading && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex animate-pulse flex-col items-center gap-6 md:flex-row md:justify-between">
                  <div className="w-full space-y-3 text-center md:text-left">
                    <div className="mx-auto h-5 w-40 rounded bg-muted md:mx-0" />
                    <div className="mx-auto h-4 w-32 rounded bg-muted md:mx-0" />
                    <div className="mx-auto h-16 w-24 rounded bg-muted md:mx-0" />
                    <div className="mx-auto h-5 w-32 rounded bg-muted md:mx-0" />
                  </div>
                  <div className="h-32 w-32 rounded-full bg-muted md:h-40 md:w-40" />
                </div>
                <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 rounded bg-muted" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 text-lg font-medium text-foreground">{value}</p>
    </div>
  );
}
