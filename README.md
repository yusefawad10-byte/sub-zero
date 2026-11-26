# Sub Zero — Mobile Recovery

A first-person, walk-around 3D website for Sub Zero, a recovery truck in Dubai that opens up into ice tubs, a cedar sauna, a stretch table and a bar, with a DJ outside.

Built with free, open-source tools: Vite, React 18, three.js 0.169, @react-three/fiber 8, @react-three/drei 9 and @react-three/postprocessing 2.16. Textures and the night HDRI are CC0 from Poly Haven.

## Run locally

```bash
npm install
npm run dev
```

Opens on http://localhost:5190.

## Edit the words and prices

Everything people read (copy, prices, hotspot cards, links) is in `src/content.js`.

## Quality

Phones get a lighter version automatically. Force it with `?quality=low` or `?quality=high`, or see the no-3D version with `?quality=static`.

## Publish

```bash
npm run build:docs
```

Builds into `docs/`, which GitHub Pages serves from the `main` branch.

## The truck model

The truck's cab, chassis, wheels and box shell are built in Blender from `blender/build_truck.py`. Rebuild the model after editing it:

```bash
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python blender/build_truck.py -- --out public/static/models/truck.glb --preview /tmp/truck-previews
```

`--preview` also renders front, cab and rear images so you can check it before reloading the site.
