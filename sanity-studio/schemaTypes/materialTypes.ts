import {createElement} from 'react'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {MaterialEntryPreviewMedia} from '../components/MaterialEntryPreviewMedia'
import {MaterialKeyInput} from '../components/MaterialKeyInput'
import {DEFAULT_MATERIAL_ENTRIES} from './materialDefaults'

export const SITE_MATERIALS_DOC_ID = 'siteMaterials'

type MaterialEntryValue = {
  key?: string
}

export const siteMaterialsType = defineType({
  name: 'siteMaterials',
  title: 'Materials',
  type: 'document',
  initialValue: {
    entries: DEFAULT_MATERIAL_ENTRIES,
  },
  fields: [
    defineField({
      name: 'entries',
      title: 'Material types',
      description:
        'Define material types for the site. Upload an SVG icon for each. Projects choose from this list for home icons and project materials. If no SVG is uploaded, the site uses the built-in icon for that ID (when one exists).',
      type: 'array',
      initialValue: DEFAULT_MATERIAL_ENTRIES,
      validation: (Rule) =>
        Rule.custom((entries) => {
          if (!Array.isArray(entries)) return true
          const keys = (entries as MaterialEntryValue[])
            .map((e) => (e?.key ? String(e.key) : ''))
            .filter(Boolean)
          const seen = new Set<string>()
          const dupes: string[] = []
          keys.forEach((k) => {
            if (seen.has(k)) dupes.push(k)
            seen.add(k)
          })
          return dupes.length ? `Duplicate IDs: ${[...new Set(dupes)].join(', ')}` : true
        }),
      of: [
        defineArrayMember({
          name: 'materialEntry',
          title: 'Material',
          type: 'object',
          fields: [
            defineField({
              name: 'key',
              title: 'ID',
              type: 'string',
              components: {
                input: MaterialKeyInput,
              },
              validation: (Rule) =>
                Rule.required().regex(
                  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                  'Use lowercase letters, numbers, and hyphens only',
                ),
            }),
            defineField({
              name: 'label',
              title: 'Display name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'iconSvg',
              title: 'Icon (SVG)',
              description:
                'Upload an SVG. Prefer a simple 24×24 (or square) line/fill icon. Leave empty to use the built-in icon for this ID, if available.',
              type: 'file',
              options: {
                accept: 'image/svg+xml,.svg',
              },
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'key',
              iconUrl: 'iconSvg.asset->url',
              key: 'key',
            },
            prepare({title, subtitle, iconUrl, key}) {
              return {
                title: title || subtitle || 'Material',
                subtitle: subtitle || '',
                media: createElement(MaterialEntryPreviewMedia, {
                  iconUrl: iconUrl ? String(iconUrl) : '',
                  iconKey: key ? String(key) : '',
                }),
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Materials'}
    },
  },
})
