/**
 * Built-in material icons (fallback when no SVG is uploaded in Studio).
 * Canonical files: site/icons/ (live site at /icons/{key}.svg).
 * Studio copies: static/icons/ — hosted Studio serves these at /static/icons/.
 */
export const BUILTIN_MATERIAL_ICONS: Record<string, string> = {
  glass: '/static/icons/glass.svg',
  textile: '/static/icons/textile.svg',
  metal: '/static/icons/metal.svg',
  performance: '/static/icons/performance.svg',
  objects: '/static/icons/objects.svg',
  sound: '/static/icons/sound.svg',
  printmaking: '/static/icons/printmaking.svg',
  lens: '/static/icons/lens.svg',
  'moving-image': '/static/icons/moving-image.svg',
}

export const BUILTIN_MATERIAL_ICON_KEYS = Object.keys(BUILTIN_MATERIAL_ICONS)
