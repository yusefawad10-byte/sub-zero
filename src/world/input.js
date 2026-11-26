// Shared input written by the DOM (keys, joystick, look zone) and read by the Player each frame.
export const input = {
  move: { x: 0, y: 0 },
  lookDX: 0,
  lookDY: 0,
  keys: {},
  active: true, // false when the 3D section is scrolled out of view
};
