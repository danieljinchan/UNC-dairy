// Shared definition of the interactive homogenizer experience:
// the hotspot zones drawn over the exterior photo. Parts are linked to a
// zone via `Part.zone` (the zone `key`). Percentage-based rectangles keep
// the hotspots easy to retune once a real photo is dropped in.

export type HotspotZone = {
  key: string;
  label: string;
  /** Short description shown on the zone label / panel header. */
  blurb: string;
  /** Rectangle as percentages of the photo (top-left origin). */
  rect: { x: number; y: number; w: number; h: number };
};

export const HOMOGENIZER_ZONES: HotspotZone[] = [
  {
    key: "valve-head",
    label: "Homogenizing valve head",
    blurb: "First-stage valve assembly where the fat globules are sheared.",
    rect: { x: 6, y: 16, w: 26, h: 34 },
  },
  {
    key: "liquid-end",
    label: "Liquid end / pump block",
    blurb: "High-pressure plungers, packings and check valves.",
    rect: { x: 35, y: 22, w: 30, h: 46 },
  },
  {
    key: "power-end",
    label: "Crankcase / power end",
    blurb: "Crankcase, lubrication and bearing protection.",
    rect: { x: 67, y: 30, w: 26, h: 42 },
  },
  {
    key: "drive",
    label: "Drive",
    blurb: "Motor drive train and V-belt.",
    rect: { x: 70, y: 74, w: 24, h: 20 },
  },
];

/** The base filename the homogenizer equipment row uses for its exterior photo. */
export const HOMOGENIZER_PHOTO = "exterior.jpg";

/** Look up a zone definition by key. */
export function getZone(key: string): HotspotZone | undefined {
  return HOMOGENIZER_ZONES.find((z) => z.key === key);
}
