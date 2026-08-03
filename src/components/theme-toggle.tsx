import { Moon, Sun, Palette, Wine } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, type Theme } from "./theme-provider";

const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "white", label: "White", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "tile", label: "Tile", icon: Palette },
  { value: "burgundy", label: "Burgundy", icon: Wine },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const active = themes.find((t) => t.value === theme) ?? themes[0]!;
  const ActiveIcon = active.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Select theme">
          <ActiveIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((t) => {
          const Icon = t.icon;
          return (
            <DropdownMenuItem
              key={t.value}
              onClick={() => setTheme(t.value)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
              {theme === t.value && (
                <span className="ml-auto text-xs text-muted-foreground">Active</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
