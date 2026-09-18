import {MaterialIconImg} from './MaterialIconImg'

type Props = {
  iconUrl?: string
  iconKey?: string
}

export function MaterialEntryPreviewMedia({iconUrl, iconKey}: Props) {
  if (!iconUrl && !iconKey) return null
  return <MaterialIconImg iconUrl={iconUrl} iconKey={iconKey} size={24} />
}
