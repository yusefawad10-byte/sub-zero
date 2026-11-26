// Shared between the 3D scene and the HTML overlay.
import { services, tour } from '../content';

// Service id -> root Object3D, registered by <Service> wrappers in the scene.
export const serviceRoots = {};

// Hooks the overlay uses: the floating card element, and a picker for taps/clicks.
export const ui = { cardEl: null, pickAt: null, docked: false };

// Which service card should be showing right now.
export function activeService(s) {
  if (s.mode !== 'walk' || s.booking) return null;
  if (s.pinned) return s.pinned;
  if (s.hover) return s.hover;
  if (s.explore === 'tour' && s.tourPhase === 'stop') return tour.stops[s.tourStop]?.service || null;
  if (s.hotspot && services[s.hotspot]) return s.hotspot;
  return null;
}
