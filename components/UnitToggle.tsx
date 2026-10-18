import { temperatureUnitLabel } from "../lib/format";
import type { TemperatureUnit } from "../lib/units";
import { useTemperatureUnit } from "./TemperatureUnitProvider";

const UNITS: TemperatureUnit[] = ["celsius", "fahrenheit"];

export function UnitToggle() {
  const { unit, setUnit } = useTemperatureUnit();

  return (
    <div className="unit-toggle" role="group" aria-label="温度单位">
      {UNITS.map((item) => (
        <button
          key={item}
          type="button"
          className={`unit-toggle__option${unit === item ? " unit-toggle__option--active" : ""}`}
          aria-pressed={unit === item}
          onClick={() => setUnit(item)}
        >
          {temperatureUnitLabel(item)}
        </button>
      ))}
    </div>
  );
}
