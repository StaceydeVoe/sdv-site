import {BUILTIN_MATERIAL_ICONS} from '../lib/builtinMaterialIcons'

type Props = {
  iconUrl?: string
  iconKey?: string
  size?: number
}

/** Resolve a material icon URL: uploaded Sanity asset, else built-in /icons/{key}.svg. */
export function resolveMaterialIconUrl(iconUrl?: string, iconKey?: string): string {
  const uploaded = String(iconUrl || '').trim()
  if (uploaded) return uploaded
  const key = String(iconKey || '').trim()
  return BUILTIN_MATERIAL_ICONS[key] || ''
}

export function MaterialIconImg({iconUrl, iconKey, size = 24}: Props) {
  const src = resolveMaterialIconUrl(iconUrl, iconKey)
  if (!src) {
    return (
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: size,
          height: size,
          borderRadius: 2,
          background: 'rgba(0,0,0,0.08)',
        }}
      />
    )
  }
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      decoding="async"
      style={{width: size, height: size, objectFit: 'contain', display: 'block'}}
    />
  )
}
