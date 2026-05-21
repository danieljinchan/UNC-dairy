# Homogenizer photos

Drop real machine photos here using the exact filenames below. The app renders
each photo automatically when the file is present, and shows a clean styled
placeholder (navy outline, sky-blue tint, camera icon, part name) when it is
not — so no code changes are needed when you add photos.

## Expected files

| Filename                | Used for                                          |
| ----------------------- | ------------------------------------------------- |
| `exterior.jpg`          | The full homogenizer photo with hotspot zones     |
| `homogenizing-valve.jpg`| Homogenizing valve seat                           |
| `plunger.jpg`           | Plungers                                          |
| `plunger-seal.jpg`      | Plunger packings / wiper box                      |
| `valve-assembly.jpg`    | Valve ball, valve spring, suction/discharge valves|
| `crankcase-oil.jpg`     | Crankcase oil                                     |
| `oil-filter.jpg`        | Oil filter cartridge                              |
| `drive-belt.jpg`        | Drive V-belt                                      |

- `exterior.jpg` looks best as a wide landscape shot (~16:10).
- Part photos look best roughly 16:9.
- The hotspot zone rectangles are percentage-based; retune them in
  `lib/homogenizer.ts` (`HOMOGENIZER_ZONES`) once the real exterior photo is in.
