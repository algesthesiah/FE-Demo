export type TemperatureUnit = "celsius" | "fahrenheit";

export const DEFAULT_TEMPERATURE_UNIT: TemperatureUnit = "celsius";

export function isTemperatureUnit(value: unknown): value is TemperatureUnit {
  return value === "celsius" || value === "fahrenheit";
}
