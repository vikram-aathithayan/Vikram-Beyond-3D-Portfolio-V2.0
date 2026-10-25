// Maps the scrolling page onto the 3D world. The camera looks down -Z from
// CAM_Z; at z = 0 one world unit equals 1/k pixels, so anything placed at a
// section's world y lines up with that section and scrolls with it. Objects
// further back (negative z) drift a little slower, which gives parallax.

export const CAM_Z = 12;
export const FOV = 40;
const HALF_TAN = Math.tan(((FOV / 2) * Math.PI) / 180);

export const SECTION_IDS = ["top", "stage", "about", "workspace", "workspace-stage", "career", "skills", "projects", "contact"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const world = {
  /** World units per CSS pixel at z = 0. */
  k: 0.01,
  /** Visible width and height at z = 0, in world units. */
  W: 14,
  H: 8.7,
  narrow: false,
  /** Document-space rects of each section, in px. */
  anchors: new Map<SectionId, { top: number; height: number; left: number; width: number }>(),
};

export function resize(width: number, height: number) {
  world.H = 2 * CAM_Z * HALF_TAN;
  world.k = world.H / height;
  world.W = world.H * (width / height);
  world.narrow = width < 768;
}

export function measure() {
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    world.anchors.set(id, { top: r.top + window.scrollY, height: r.height, left: r.left, width: r.width });
  }
}

/** World y of a point `f` of the way down a section (0 = top, 0.5 = middle). */
export function sectionY(id: SectionId, f = 0.5) {
  const a = world.anchors.get(id);
  if (!a) return 1000; // not measured yet: park it far away
  return -(a.top + a.height * f) * world.k;
}

/** World x of a section's horizontal centre (camera at x = 0 is the page centre). */
export function sectionCenterX(id: SectionId) {
  const a = world.anchors.get(id);
  if (!a) return 0;
  return (a.left + a.width / 2 - window.innerWidth / 2) * world.k;
}

/** True when the object and all its ancestors are visible, i.e. it's on screen. */
export function isShown(obj: { visible: boolean; parent: unknown } | null): boolean {
  for (let o = obj as { visible: boolean; parent: unknown } | null; o; o = o.parent as typeof o) if (!o.visible) return false;
  return true;
}

/** World y the camera sits at for the current scroll position. */
export function cameraY() {
  return -(window.scrollY + window.innerHeight / 2) * world.k;
}
