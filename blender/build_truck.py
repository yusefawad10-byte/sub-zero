"""Build the Sub Zero truck in Blender and export it for the website.

Run headless:
  /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
      --python blender/build_truck.py -- --out public/static/models/truck.glb --preview /tmp/previews

Coordinates are written in the website's three.js frame (x right, y up, z towards the viewer)
and converted to Blender's (x, -z, y) on the way in, so the GLB lines up with src/world/layout.js:
truck along x, open side facing +z, cab on the left (-x), cargo box x -3.6..3.6, z -1.3..1.3,
floor at y 0.6, ceiling at 3.4. Only the shell, cab, chassis and wheels are modelled here; the
interior, lettering and lights stay in the React code.
"""

import math
import os
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
OUT = argv[argv.index("--out") + 1] if "--out" in argv else "truck.glb"
PREVIEW = argv[argv.index("--preview") + 1] if "--preview" in argv else None


def T(x, y, z):
    """three.js position -> Blender position"""
    return Vector((x, -z, y))


bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
truck = bpy.data.collections.new("Truck")
scene.collection.children.link(truck)

# ---------------------------------------------------------------- materials
MATS = {}


def mat(name, color, metal=0.0, rough=0.5, coat=0.0, coat_rough=0.1, emit=None, strength=0.0, trans=0.0, ior=1.45):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Metallic"].default_value = metal
    p.inputs["Roughness"].default_value = rough
    if coat:
        p.inputs["Coat Weight"].default_value = coat
        p.inputs["Coat Roughness"].default_value = coat_rough
    if emit:
        p.inputs["Emission Color"].default_value = (*emit, 1)
        p.inputs["Emission Strength"].default_value = strength
    if trans:
        p.inputs["Transmission Weight"].default_value = trans
        p.inputs["IOR"].default_value = ior
    MATS[name] = m
    return m


def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((v / 12.92) if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c)


mat("Paint", srgb("#090a0c"), metal=0.35, rough=0.32, coat=1.0, coat_rough=0.06)
mat("Seam", srgb("#020203"), rough=0.6)
mat("Glass", srgb("#16232c"), metal=0.0, rough=0.03, trans=0.85, ior=1.5)
mat("Chrome", srgb("#c8ccd0"), metal=1.0, rough=0.16)
mat("Alu", srgb("#8d9399"), metal=0.9, rough=0.32)
mat("Rubber", srgb("#0d0d0d"), rough=0.92)
mat("Trim", srgb("#191b1e"), metal=0.6, rough=0.35)
mat("Plastic", srgb("#191a1b"), rough=0.7)
mat("Interior", srgb("#050505"), rough=0.95)
mat("Lens", srgb("#ffffff"), rough=0.1, emit=srgb("#fff3df"), strength=6.0)
mat("Amber", srgb("#ff9a1a"), rough=0.2, emit=srgb("#ffae3a"), strength=4.0)
mat("Tail", srgb("#400000"), rough=0.2, emit=srgb("#ff2a1a"), strength=4.0)
mat("Plate", srgb("#e9e6dc"), rough=0.5)


# ---------------------------------------------------------------- helpers
def link(obj, material=None):
    truck.objects.link(obj)
    if material:
        obj.data.materials.append(MATS[material] if isinstance(material, str) else material)
    return obj


def box(name, x0, x1, y0, y1, z0, z1, material, bevel=0.0, segs=3):
    """axis-aligned box given in three.js ranges"""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    sx, sy, sz = x1 - x0, y1 - y0, z1 - z0
    c = T((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
    bmesh.ops.transform(bm, matrix=Matrix.Diagonal((sx, sz, sy, 1)), verts=bm.verts)
    bmesh.ops.translate(bm, vec=c, verts=bm.verts)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = link(bpy.data.objects.new(name, me), material)
    if bevel:
        b = o.modifiers.new("bevel", "BEVEL")
        b.width = bevel
        b.segments = segs
        b.limit_method = "ANGLE"
        b.harden_normals = False
    return o


def extrude_profile(name, pts, z0, z1, material, bevel=0.0, segs=4):
    """2D profile in the three.js x/y plane, extruded across z0..z1"""
    bm = bmesh.new()
    vs = [bm.verts.new(T(x, y, z0)) for x, y in pts]
    face = bm.faces.new(vs)
    res = bmesh.ops.extrude_face_region(bm, geom=[face])
    moved = [e for e in res["geom"] if isinstance(e, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=T(0, 0, z1 - z0) - T(0, 0, 0), verts=moved)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = link(bpy.data.objects.new(name, me), material)
    if bevel:
        b = o.modifiers.new("bevel", "BEVEL")
        b.width = bevel
        b.segments = segs
        b.limit_method = "ANGLE"
        b.angle_limit = math.radians(25)
    for poly in o.data.polygons:
        poly.use_smooth = True
    return o


def quad(name, pts3, material):
    """flat polygon from three.js points"""
    bm = bmesh.new()
    bm.faces.new([bm.verts.new(T(*p)) for p in pts3])
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    return link(bpy.data.objects.new(name, me), material)


def cylinder(name, center, radius, depth, axis, material, verts=32, bevel=0.0, segs=3):
    """axis: 'x', 'y' or 'z' in three.js terms"""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=radius, radius2=radius, depth=depth)
    # created along Blender z (= three y)
    if axis == "x":
        bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.pi / 2, 3, "Y"))
    elif axis == "z":
        bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.pi / 2, 3, "X"))
    bmesh.ops.translate(bm, vec=T(*center), verts=bm.verts)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = link(bpy.data.objects.new(name, me), material)
    for poly in o.data.polygons:
        poly.use_smooth = True
    if bevel:
        b = o.modifiers.new("bevel", "BEVEL")
        b.width = bevel
        b.segments = segs
        b.limit_method = "ANGLE"
    return o


def boolean_cut(target, cutter):
    m = target.modifiers.new("cut", "BOOLEAN")
    m.operation = "DIFFERENCE"
    m.object = cutter
    m.solver = "EXACT"
    # boolean must run before bevel
    while target.modifiers[0] != m:
        bpy.context.view_layer.objects.active = target
        with bpy.context.temp_override(object=target):
            bpy.ops.object.modifier_move_up(modifier=m.name)
    cutter.hide_render = True
    cutter.hide_set(True)
    cutter["cutter"] = True


# ---------------------------------------------------------------- cargo box shell
X0, X1 = -3.6, 3.6
box("Box_Back", X0 - 0.02, X1 + 0.1, 0.45, 3.56, -1.4, -1.3, "Paint", bevel=0.015)
box("Box_EndRear", X1, X1 + 0.1, 0.45, 3.56, -1.4, 1.32, "Paint", bevel=0.015)
box("Box_EndFront", X0 - 0.1, X0, 0.45, 3.56, -1.4, 1.36, "Paint", bevel=0.015)
box("Box_Roof", X0 - 0.1, X1 + 0.1, 3.4, 3.56, -1.4, 1.36, "Paint", bevel=0.02)
box("Box_Panel", X0, -1.5, 0.45, 3.4, 1.25, 1.35, "Paint", bevel=0.01)
box("Box_Floor", X0, X1, 0.45, 0.6, -1.3, 1.3, "Trim")
box("Box_Header", -1.5, X1 + 0.1, 3.27, 3.41, 1.24, 1.31, "Trim", bevel=0.01)
box("Box_Post", X1 - 0.1, X1 + 0.02, 0.6, 3.4, 1.22, 1.32, "Paint", bevel=0.01)
# aluminium corner trims and roof rails, as on real box bodies
for (x, z) in [(X0 - 0.1, -1.4), (X1 + 0.1, -1.4), (X1 + 0.1, 1.32), (X0 - 0.1, 1.36)]:
    box("Trim_Corner", x - 0.035, x + 0.035, 0.45, 3.58, z - 0.035, z + 0.035, "Trim", bevel=0.008)
for z in (-1.4, 1.36):
    box("Trim_RoofRail", X0 - 0.12, X1 + 0.12, 3.54, 3.6, z - 0.035, z + 0.035, "Trim", bevel=0.008)
box("Trim_BottomRail", X0 - 0.1, X1 + 0.1, 0.42, 0.5, -1.44, -1.36, "Trim", bevel=0.008)
# panel seams on the box sides, as on real sandwich-panel bodies
for x in (-2.4, -1.2, 0.0, 1.2, 2.4):
    box("Seam_Back", x - 0.005, x + 0.005, 0.5, 3.5, -1.406, -1.399, "Seam")
box("Seam_BackTop", X0, X1, 3.3, 3.31, -1.406, -1.399, "Seam")
box("Seam_PanelTop", X0, -1.5, 3.3, 3.31, 1.35, 1.357, "Seam")
box("Seam_PanelBottom", X0, -1.5, 0.66, 0.67, 1.35, 1.357, "Seam")
for z in (-0.75, 0.6):
    box("Seam_Front", X0 - 0.107, X0 - 0.1, 0.5, 3.5, z - 0.005, z + 0.005, "Seam")
# rear doors outline and hinges on the rear end
for z in (-0.04,):
    box("Rear_DoorSeam", X1 + 0.1, X1 + 0.112, 0.55, 3.35, z - 0.006, z + 0.006, "Trim")
for y in (0.9, 1.9, 2.9):
    for z in (-1.3, 1.2):
        box("Rear_Hinge", X1 + 0.1, X1 + 0.13, y - 0.05, y + 0.05, z - 0.06, z + 0.06, "Alu", bevel=0.005)
for z in (-0.25, 0.17):
    box("Rear_LockBar", X1 + 0.1, X1 + 0.125, 0.6, 3.3, z - 0.012, z + 0.012, "Alu")
# tail lights and rear bumper
for z in (-1.1, 1.0):
    box("Tail_Light", X1 + 0.1, X1 + 0.14, 0.62, 0.84, z - 0.17, z + 0.17, "Tail", bevel=0.01)
box("Rear_Bumper", X1 - 0.05, X1 + 0.18, 0.28, 0.42, -1.25, 1.2, "Trim", bevel=0.02)

# ---------------------------------------------------------------- chassis
for z in (-0.45, 0.45):
    box("Chassis_Rail", -5.85, X1 + 0.05, 0.32, 0.5, z - 0.07, z + 0.07, "Plastic")
cylinder("Fuel_Tank", (-3.1, 0.52, -1.0), 0.24, 0.9, "x", "Alu", verts=28, bevel=0.03)
for z in (-1.3, 1.26):
    box("Side_Guard", -3.75, -2.15, 0.36, 0.4, z - 0.02, z + 0.02, "Alu")
    box("Side_Guard", -1.95, X1 - 0.2, 0.36, 0.4, z - 0.02, z + 0.02, "Alu")

# ---------------------------------------------------------------- cab
W = 1.3  # half width
CAB = [
    (-6.2, 0.38),
    (-6.17, 1.55),
    (-6.05, 1.8),
    (-5.42, 3.02),
    (-5.15, 3.16),
    (-3.72, 3.16),
    (-3.72, 0.42),
]
cab = extrude_profile("Cab_Body", CAB, -W, W, "Paint", bevel=0.17, segs=6)
arch = cylinder("Cab_ArchCut", (-4.95, 0.5, 0), 0.63, 3.0, "z", "Trim", verts=48)
boolean_cut(cab, arch)
# black wheel-arch liner: a half torus over each front tyre
for s in (-1, 1):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=False, segments=40, radius1=0.64, radius2=0.64, depth=0.3)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y < -0.05], context="VERTS")
    bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.pi / 2, 3, "X"))
    bmesh.ops.translate(bm, vec=T(-4.95, 0.5, s * (W - 0.18)), verts=bm.verts)
    me = bpy.data.meshes.new("ArchLiner")
    bm.to_mesh(me)
    bm.free()
    liner = link(bpy.data.objects.new("Cab_ArchLiner", me), "Plastic")
    liner.modifiers.new("solid", "SOLIDIFY").thickness = 0.03

# roof fairing up to the box
extrude_profile(
    "Cab_Fairing",
    [(-5.05, 3.14), (-3.66, 3.14), (-3.66, 3.54), (-3.9, 3.55), (-4.55, 3.36)],
    -1.22,
    1.22,
    "Paint",
    bevel=0.08,
)
# dark interior seen through the glass
box("Cab_Interior", -5.75, -3.85, 1.6, 3.0, -1.15, 1.15, "Interior")
box("Cab_Dash", -5.95, -5.5, 1.6, 2.05, -1.15, 1.15, "Plastic", bevel=0.04)
cylinder("Cab_Wheel", (-5.45, 2.15, 0.6), 0.2, 0.04, "x", "Plastic", verts=24)

# windshield (follows the sloped front, sits just proud of it)
nx, ny = (3.02 - 1.8), -(-5.42 + 6.05)  # outward normal of the slope
ln = math.hypot(nx, ny)
ox, oy = nx / ln * 0.012, ny / ln * 0.012
quad(
    "Glass_Windshield",
    [
        (-5.98 - ox, 1.93 - oy, -1.12),
        (-5.98 - ox, 1.93 - oy, 1.12),
        (-5.5 - ox, 2.86 - oy, 1.08),
        (-5.5 - ox, 2.86 - oy, -1.08),
    ],
    "Glass",
)
box("Wiper", -6.02, -5.97, 1.9, 1.94, -0.9, 0.0, "Plastic")
box("Wiper", -6.02, -5.97, 1.9, 1.94, 0.1, 0.95, "Plastic")
# side windows and door details on both sides
for s in (-1, 1):
    zf = s * (W + 0.004)
    quad(
        "Glass_Side",
        [(-5.78, 1.98, zf), (-4.0, 1.98, zf), (-4.0, 2.95, zf), (-5.3, 2.95, zf)],
        "Glass",
    )
    zs = s * (W + 0.006)
    # door seam lines
    for x in (-5.82, -3.95):
        box("Door_Seam", x - 0.006, x + 0.006, 1.06, 2.98, zs - 0.004, zs + 0.004, "Interior")
    box("Door_Handle", -4.3, -4.12, 1.72, 1.76, zs, zs + s * 0.03, "Chrome", bevel=0.008)
    # entry step
    box("Cab_Step", -4.38, -3.86, 0.44, 0.48, s * (W - 0.05) - 0.12, s * (W - 0.05) + 0.12, "Alu", bevel=0.01)
    # mirror arm and housing
    box("Mirror_Arm", -5.62, -5.58, 2.45, 2.49, *sorted((s * W, s * (W + 0.32))), "Trim")
    box("Mirror_Arm", -5.62, -5.58, 1.95, 1.99, *sorted((s * W, s * (W + 0.32))), "Trim")
    box("Mirror", -5.66, -5.54, 1.86, 2.5, s * (W + 0.3) - 0.09, s * (W + 0.3) + 0.09, "Paint", bevel=0.03)
    box("Mirror_Glass", -5.68, -5.66, 1.9, 2.46, s * (W + 0.3) - 0.07, s * (W + 0.3) + 0.07, "Chrome")

# front: grille, chrome bars, headlights, indicators, bumper, plate
box("Grille", -6.205, -6.17, 0.98, 1.5, -0.68, 0.68, "Plastic", bevel=0.02)
for y in (1.06, 1.16, 1.26, 1.36):
    box("Grille_Bar", -6.225, -6.2, y - 0.012, y + 0.012, -0.64, 0.64, "Chrome")
for s in (-1, 1):
    box("Headlight", -6.21, -6.15, 1.0, 1.22, s * 0.96 - 0.22, s * 0.96 + 0.22, "Lens", bevel=0.03)
    box("Headlight_Rim", -6.2, -6.16, 0.97, 1.25, s * 0.96 - 0.25, s * 0.96 + 0.25, "Chrome", bevel=0.02)
    box("Indicator", -6.21, -6.15, 0.86, 0.92, s * 1.05 - 0.13, s * 1.05 + 0.13, "Amber", bevel=0.01)
    box("Fog_Light", -6.33, -6.28, 0.52, 0.6, s * 0.95 - 0.09, s * 0.95 + 0.09, "Lens", bevel=0.01)
box("Front_Bumper", -6.32, -6.0, 0.36, 0.78, -1.34, 1.34, "Plastic", bevel=0.05)
box("Front_Plate", -6.335, -6.32, 0.62, 0.74, -0.26, 0.26, "Plate")
box("Badge", -6.23, -6.2, 1.52, 1.6, -0.18, 0.18, "Chrome", bevel=0.01)
# roof marker lights on the cab
for z in (-0.5, -0.17, 0.17, 0.5):
    box("Marker", -5.2, -5.12, 3.15, 3.2, z - 0.05, z + 0.05, "Amber", bevel=0.01)


# ---------------------------------------------------------------- wheels
def tread(name, x, z, radius=0.5, width=0.27, blocks=44):
    """raised tread blocks all round the tyre, in two staggered rows"""
    bm = bmesh.new()
    for i in range(blocks):
        for row, off in ((0, -0.07), (1, 0.07)):
            a = (i + 0.5 * row) / blocks * math.tau
            geom = bmesh.ops.create_cube(bm, size=1.0)
            vs = geom["verts"]
            # block: 0.045 along the tread, 0.11 across, 0.018 tall
            bmesh.ops.transform(bm, matrix=Matrix.Diagonal((0.045, 0.11, 0.018, 1)), verts=vs)
            bmesh.ops.translate(bm, vec=Vector((0, off, radius + 0.004)), verts=vs)
            bmesh.ops.rotate(bm, verts=vs, cent=(0, 0, 0), matrix=Matrix.Rotation(a, 3, "Y"))
            bmesh.ops.translate(bm, vec=T(x, 0.5, z), verts=vs)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    return link(bpy.data.objects.new(name, me), "Rubber")


def wheel(name, x, z, outward):
    """tyre + rim with hub, spokes and lug nuts; outward is +1/-1 along z"""
    tyre = cylinder(f"{name}_Tyre", (x, 0.5, z), 0.49, 0.32, "z", "Rubber", verts=48, bevel=0.07, segs=4)
    tread(f"{name}_Tread", x, z, radius=0.482)
    face = z + outward * 0.165
    cylinder(f"{name}_Rim", (x, 0.5, face), 0.31, 0.02, "z", "Chrome", verts=36)
    cylinder(f"{name}_RimDish", (x, 0.5, face + outward * 0.01), 0.22, 0.02, "z", "Alu", verts=32)
    cylinder(f"{name}_Hub", (x, 0.5, face + outward * 0.03), 0.09, 0.06, "z", "Chrome", verts=20, bevel=0.02)
    for i in range(8):
        a = i / 8 * math.tau
        cylinder(
            f"{name}_Nut",
            (x + math.cos(a) * 0.14, 0.5 + math.sin(a) * 0.14, face + outward * 0.025),
            0.016,
            0.04,
            "z",
            "Chrome",
            verts=6,
        )
    for i in range(10):
        a = i / 10 * math.tau
        cylinder(
            f"{name}_Hole",
            (x + math.cos(a) * 0.26, 0.5 + math.sin(a) * 0.26, face + outward * 0.012),
            0.03,
            0.012,
            "z",
            "Interior",
            verts=10,
        )
    return tyre


for s in (-1, 1):
    wheel("Front", -4.95, s * 1.1, s)
    # rear axle sits under the closed storage section, so it never pokes into the walkable floor
    wheel("RearOuter", -2.6, s * 1.1, s)
    wheel("RearInner", -2.6, s * 0.76, s)
    # mudflap behind the rear wheels
    box("Mudflap", -2.0, -1.98, 0.12, 0.62, s * 1.1 - 0.2, s * 1.1 + 0.2, "Rubber")

# ---------------------------------------------------------------- previews
if PREVIEW:
    os.makedirs(PREVIEW, exist_ok=True)
    world = bpy.data.worlds.new("World")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.03, 0.035, 0.045, 1)
    world.node_tree.nodes["Background"].inputs[1].default_value = 1.0
    scene.world = world
    previews = bpy.data.collections.new("Preview")
    scene.collection.children.link(previews)

    def light(name, kind, loc, energy, color=(1, 1, 1), size=1.0, rot=None):
        ld = bpy.data.lights.new(name, kind)
        ld.energy = energy
        ld.color = color
        if hasattr(ld, "size"):
            ld.size = size
        lo = bpy.data.objects.new(name, ld)
        lo.location = loc
        if rot:
            lo.rotation_euler = rot
        previews.objects.link(lo)
        return lo

    light("Key", "AREA", T(-2, 6, 8), 2500, (1.0, 0.85, 0.7), size=6, rot=(math.radians(35), 0, math.radians(-10)))
    light("Rim", "AREA", T(4, 6, -6), 1500, (0.6, 0.75, 1.0), size=6, rot=(math.radians(-35), 0, math.radians(180)))
    light("Fill", "SUN", (0, 0, 10), 1.2, (0.7, 0.8, 1.0), rot=(math.radians(50), 0, math.radians(30)))

    ground = bpy.data.meshes.new("Ground")
    gb = bmesh.new()
    bmesh.ops.create_grid(gb, x_segments=1, y_segments=1, size=30)
    gb.to_mesh(ground)
    gb.free()
    g = bpy.data.objects.new("Ground", ground)
    gm = bpy.data.materials.new("GroundMat")
    gm.use_nodes = True
    gp = next(n for n in gm.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    gp.inputs["Base Color"].default_value = (0.02, 0.02, 0.022, 1)
    gp.inputs["Roughness"].default_value = 0.35
    g.data.materials.append(gm)
    previews.objects.link(g)

    cam_d = bpy.data.cameras.new("Cam")
    cam_d.lens = 32
    cam = bpy.data.objects.new("Cam", cam_d)
    previews.objects.link(cam)
    scene.camera = cam

    engines = [i.identifier for i in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]
    scene.render.engine = "BLENDER_EEVEE" if "BLENDER_EEVEE" in engines else engines[0]
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.image_settings.file_format = "PNG"
    try:
        scene.view_settings.view_transform = "AgX"
    except TypeError:
        pass

    views = {
        "front": ((-0.3, 2.0, 11.0), (-0.8, 1.6, 0.0)),
        "cab": ((-9.5, 1.9, 5.5), (-4.6, 1.5, 0.0)),
        "rear": ((8.0, 2.2, -6.5), (1.0, 1.7, 0.0)),
    }
    for name, (eye, at) in views.items():
        cam.location = T(*eye)
        d = T(*at) - T(*eye)
        cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
        scene.render.filepath = os.path.join(PREVIEW, f"{name}.png")
        bpy.ops.render.render(write_still=True)
        print("rendered", scene.render.filepath)

    # keep preview helpers out of the export
    for o in list(previews.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    bpy.data.collections.remove(previews)

# ---------------------------------------------------------------- export
for o in list(truck.objects):
    if o.get("cutter"):
        o.hide_set(False)
        o.hide_render = False
        o.select_set(False)
bpy.ops.object.select_all(action="DESELECT")
for o in truck.objects:
    if not o.get("cutter"):
        o.select_set(True)
os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=os.path.abspath(OUT),
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_yup=True,
    export_cameras=False,
    export_lights=False,
)
print("exported", os.path.abspath(OUT), len([o for o in truck.objects if not o.get("cutter")]), "objects")
