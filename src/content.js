// Every piece of text, price, hotspot line and link on the site lives here.

export const brand = {
  name: 'Sub Zero',
  short: 'SZ',
  eyebrow: 'Mobile recovery · Dubai',
  line: 'A truck that opens up. Air conditioned inside.',
  taglines: ['Recover. Move. Belong.', 'Cold bodies, clear minds, better days.'],
  where: 'Parks at padel clubs, gyms, football pitches and run clubs.',
};

export const plans = [
  {
    id: 'dropin',
    name: 'Drop-in',
    price: 'AED 60',
    detail: 'One twenty-minute slot: tub, sauna, out.',
  },
  {
    id: 'pass',
    name: 'Ten-slot Pass',
    price: 'AED 350',
    detail: 'Paid once, used all month.',
    note: 'Works out at AED 35 a session.',
    best: true,
  },
  {
    id: 'club',
    name: 'Club Night',
    price: 'AED 2,400',
    detail: 'Four hours parked, one flat fee.',
  },
  {
    id: 'bar',
    name: 'From the bar',
    price: 'AED 25',
    detail: 'No session needed.',
  },
];

export const planById = Object.fromEntries(plans.map((p) => [p.id, p]));

export const nav = {
  links: [
    { label: 'Walk in', href: '#walk', action: 'walk' },
    { label: 'Prices', href: '#prices' },
    { label: 'Tonight', href: '#tonight' },
    { label: 'Safety', href: '#safety' },
  ],
  cta: 'Book a slot',
};

export const intro = {
  walk: 'Walk in',
  book: 'Book a slot',
  loading: (n) => `Loading ${n}%`,
  loadingScreen: 'Parking the truck',
};

export const hud = {
  chips: [
    { id: 'dj', label: 'DJ' },
    { id: 'tubs', label: 'Ice tubs' },
    { id: 'sauna', label: 'Sauna' },
    { id: 'bar', label: 'Bar' },
    { id: 'outside', label: 'Outside' },
  ],
  musicOn: 'Music on',
  musicOff: 'Music off',
  hintDesktop: 'W A S D to walk · Shift to jog · Click to look around · Esc to let go',
  hintTouch: 'Left thumb to walk · Drag on the right to look',
  bookThis: 'Book this',
  pressE: 'or press E',
  exit: 'Back to the page',
};

export const hotspots = {
  dj: {
    title: 'The DJ',
    line: 'Deep house at 122 bpm, right outside the truck. Stay for a song after your slot.',
    plan: 'club',
  },
  tubs: {
    title: 'Ice tubs',
    line: 'Two clear tubs of icy water. Get in up to the chest and breathe slowly.',
    plan: 'dropin',
  },
  stretch: {
    title: 'Stretch table',
    line: 'A padded table on the deck to loosen up before or after the cold.',
    plan: 'pass',
  },
  sauna: {
    title: 'Cedar sauna',
    line: 'Step in, sit on the top bench and let the heat do the rest.',
    plan: 'dropin',
  },
  bar: {
    title: 'The bar',
    line: 'Protein shakes, young coconuts and electrolytes.',
    plan: 'bar',
  },
  middle: {
    title: 'Inside the truck',
    line: 'Air conditioned, towels ready, music piped in from outside.',
    plan: 'pass',
  },
};

// Lettering painted on and inside the 3D truck
export const truckText = {
  back: 'SUB ZERO',
  backSub: 'RECOVER · MOVE · BELONG',
  sign: 'SUB ZERO',
  signSub: 'recovery truck',
  chalkTitle: 'Tonight at the truck',
  aframe: ['COLD BODIES', 'CLEAR MINDS', 'BETTER DAYS'],
};

export const pricing = {
  eyebrow: 'Prices',
  title: 'Pick a slot. Get cold. Feel better.',
  best: 'Best value',
  cta: 'Book this',
};

export const tonight = {
  eyebrow: 'Where we are tonight',
  title: 'Find the truck',
  place: 'Kite Beach car park',
  area: 'Jumeirah',
  hours: '7:00 pm to midnight',
  mapsLabel: 'Open in Maps',
  mapsUrl: 'https://maps.google.com/?q=Kite+Beach+car+park+Jumeirah+Dubai',
  note: 'We move around the city. This changes every night.',
};

export const safety = {
  eyebrow: 'Safety',
  title: 'Cold and heat, done properly.',
  items: [
    {
      title: 'Waivers first',
      text: 'Everyone fills in a short health waiver before their first slot. No waiver, no tub.',
    },
    {
      title: 'A supervised protocol',
      text: 'Set times in the tub and the sauna, with breaks in between. We tell you when to get out.',
    },
    {
      title: 'A trained person on site',
      text: 'Someone trained in first aid and cold-water safety is on the deck for every slot.',
    },
  ],
};

export const booking = {
  eyebrow: 'Book',
  title: 'Book a slot',
  name: 'Name',
  phone: 'Phone (WhatsApp)',
  slot: 'Slot type',
  date: 'Date',
  submit: 'Book a slot',
  errors: {
    name: 'Please add your name.',
    phone: 'Please add a phone number we can WhatsApp.',
    date: 'Please pick today or a later date.',
  },
  success: (name, plan, date) =>
    `Thanks, ${name}. Your ${plan} on ${date} is noted.`,
  demoNote: 'Online booking is not live yet, so nothing was sent.',
};

export const footer = {
  line: 'Recover. Move. Belong.',
  links: [
    { label: 'Instagram', href: 'https://instagram.com/' },
    { label: 'WhatsApp', href: 'https://wa.me/' },
  ],
  small: 'Sub Zero · Mobile recovery · Dubai',
};

export const staticHero = {
  note: 'The 3D walk-through is switched off on this device. Here is the truck.',
  alt: 'The Sub Zero truck at night with its side opened up: ice tubs, a cedar sauna, a bar and people after training.',
};
