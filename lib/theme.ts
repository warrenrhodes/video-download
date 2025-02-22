export type Theme = "light" | "dark";

export interface ThemeContextType {
  theme: Theme;
  setTheme: (Theme: Theme) => void;
}
