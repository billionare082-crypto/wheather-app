import { cn } from "@/lib/utils";

export type WeatherIconProps = {
  code: number;
  isDay?: boolean;
  className?: string;
};

export function WeatherIcon({ code, isDay = true, className }: WeatherIconProps) {
  // Clear sky
  if (code === 0) {
    return isDay ? (
      <svg viewBox="0 0 64 64" className={cn("fill-none", className)}>
        <circle cx="32" cy="32" r="12" className="fill-weather-sunny" />
        <g className="stroke-weather-sunny stroke-2">
          <line x1="32" y1="6" x2="32" y2="14" />
          <line x1="32" y1="50" x2="32" y2="58" />
          <line x1="6" y1="32" x2="14" y2="32" />
          <line x1="50" y1="32" x2="58" y2="32" />
          <line x1="13.7" y1="13.7" x2="19.4" y2="19.4" />
          <line x1="44.6" y1="44.6" x2="50.3" y2="50.3" />
          <line x1="13.7" y1="50.3" x2="19.4" y2="44.6" />
          <line x1="44.6" y1="19.4" x2="50.3" y2="13.7" />
        </g>
      </svg>
    ) : (
      <svg viewBox="0 0 64 64" className={cn("fill-none", className)}>
        <path
          d="M42 18a10 10 0 0 1 0 20 10 10 0 0 1-8-4 12 12 0 1 0-20 0 10 10 0 0 1-8 4 10 10 0 0 1 0-20c1.3 0 2.5.3 3.6.7A14 14 0 0 1 42 18z"
          className="fill-weather-cloudy"
        />
        <circle cx="48" cy="14" r="3" className="fill-weather-sunny-soft" />
      </svg>
    );
  }

  // Partly cloudy / overcast
  if (code >= 1 && code <= 3) {
    return (
      <svg viewBox="0 0 64 64" className={cn("fill-none", className)}>
        <circle
          cx="26"
          cy="26"
          r="10"
          className={isDay ? "fill-weather-sunny" : "fill-weather-cloudy"}
        />
        <path
          d="M44 22a10 10 0 0 1 0 20 10 10 0 0 1-8-4 12 12 0 1 0-20 0 10 10 0 0 1-8 4 10 10 0 0 1 0-20c1.3 0 2.5.3 3.6.7A14 14 0 0 1 44 22z"
          className="fill-weather-cloudy"
        />
      </svg>
    );
  }

  // Fog
  if (code === 45 || code === 48) {
    return (
      <svg viewBox="0 0 64 64" className={cn("fill-none", className)}>
        <line x1="10" y1="24" x2="54" y2="24" className="stroke-weather-fog stroke-2" />
        <line x1="14" y1="32" x2="50" y2="32" className="stroke-weather-fog stroke-2" />
        <line x1="10" y1="40" x2="54" y2="40" className="stroke-weather-fog stroke-2" />
      </svg>
    );
  }

  // Drizzle / rain / showers
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return (
      <svg viewBox="0 0 64 64" className={cn("fill-none", className)}>
        <path
          d="M44 16a10 10 0 0 1 0 20 10 10 0 0 1-8-4 12 12 0 1 0-20 0 10 10 0 0 1-8 4 10 10 0 0 1 0-20c1.3 0 2.5.3 3.6.7A14 14 0 0 1 44 16z"
          className="fill-weather-cloudy"
        />
        <g className="stroke-weather-rain stroke-2">
          <line x1="22" y1="40" x2="20" y2="48" />
          <line x1="32" y1="40" x2="30" y2="48" />
          <line x1="42" y1="40" x2="40" y2="48" />
        </g>
      </svg>
    );
  }

  // Snow
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return (
      <svg viewBox="0 0 64 64" className={cn("fill-none", className)}>
        <path
          d="M44 16a10 10 0 0 1 0 20 10 10 0 0 1-8-4 12 12 0 1 0-20 0 10 10 0 0 1-8 4 10 10 0 0 1 0-20c1.3 0 2.5.3 3.6.7A14 14 0 0 1 44 16z"
          className="fill-weather-cloudy"
        />
        <g className="fill-weather-snow">
          <circle cx="22" cy="44" r="1.5" />
          <circle cx="32" cy="50" r="1.5" />
          <circle cx="42" cy="44" r="1.5" />
          <circle cx="27" cy="56" r="1.5" />
          <circle cx="37" cy="56" r="1.5" />
        </g>
      </svg>
    );
  }

  // Thunderstorm
  if (code >= 95 && code <= 99) {
    return (
      <svg viewBox="0 0 64 64" className={cn("fill-none", className)}>
        <path
          d="M44 16a10 10 0 0 1 0 20 10 10 0 0 1-8-4 12 12 0 1 0-20 0 10 10 0 0 1-8 4 10 10 0 0 1 0-20c1.3 0 2.5.3 3.6.7A14 14 0 0 1 44 16z"
          className="fill-weather-storm"
        />
        <path d="M30 36 L24 48 L32 48 L28 60 L40 44 L32 44 Z" className="fill-weather-sunny" />
      </svg>
    );
  } return (
    <svg viewBox="0 0 64 64" className={cn("fill-none", className)}>
      <circle cx="32" cy="32" r="12" className="fill-weather-cloudy" />
    </svg>
  );
}
