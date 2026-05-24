import type { Location } from '../game/types';
import { REGULAR_GEMS } from '../game/types';
import { GEM_COLORS } from './GemToken';

interface LocationRowProps {
  locations: Location[];
}

export default function LocationRow({ locations }: LocationRowProps) {
  if (locations.length === 0) return null;

  return (
    <div className="location-row">
      <h3 className="location-row__title">Locations</h3>
      <div className="location-row__tiles">
        {locations.map((loc) => {
          const reqs = REGULAR_GEMS.filter((g) => (loc.requires[g] ?? 0) > 0);
          return (
            <div key={loc.id} className="location-tile">
              <span className="location-tile__points">{loc.points}</span>
              <div className="location-tile__requires">
                {reqs.map((gem) => (
                  <span
                    key={gem}
                    className="location-tile__req"
                    style={{ backgroundColor: GEM_COLORS[gem] }}
                  >
                    {loc.requires[gem]}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
