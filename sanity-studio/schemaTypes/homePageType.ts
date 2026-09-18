import {defineField, defineType} from 'sanity'
import {fontRoleField} from './fontRole'
import {hexColorField} from './hexColorField'

export const HOME_PAGE_DOC_ID = 'homePageConfig'

export const homePageType = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  fieldsets: [
    {name: 'appearance', title: 'Appearance', options: {collapsible: true, collapsed: false}},
    {name: 'splash', title: 'Splash', options: {collapsible: true, collapsed: false}},
    {name: 'notice', title: 'Site notice', options: {collapsible: true, collapsed: false}},
    {name: 'nav', title: 'Project navigation', options: {collapsible: true}},
  ],
  fields: [
    hexColorField('backgroundColor', 'Background color', {
      description: 'Optional site-wide home default. Project pages can override.',
      fieldset: 'appearance',
    }),
    defineField({
      name: 'splashText',
      title: 'Splash text',
      type: 'string',
      initialValue: 'STACEY DE VOE',
      description:
        'Shown on the entry splash before the home page. Displayed in all caps. Clicking it enters the site.',
      fieldset: 'splash',
      validation: (Rule) => Rule.required().max(60),
    }),
    fontRoleField(
      'splashFont',
      'Splash font',
      'Optional override for the splash name.',
      {fieldset: 'splash'},
    ),
    defineField({
      name: 'showUnderConstruction',
      title: 'Show under-construction notice',
      type: 'boolean',
      initialValue: false,
      description:
        'When on, a small notice appears at the top center of the home page (not on the splash). Turn off when the site is ready.',
      fieldset: 'notice',
    }),
    defineField({
      name: 'underConstructionMessage',
      title: 'Notice text',
      type: 'string',
      initialValue: 'Website under construction',
      description: 'Shown only when the notice is enabled. Keep it short.',
      fieldset: 'notice',
      hidden: ({parent}) => !parent?.showUnderConstruction,
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: 'entries',
      title: 'Projects on home (order)',
      description:
        'Order defines carousel / nav order. Optional label overrides the project title. Removing a project here (or deleting it under Projects) takes it off the home page.',
      type: 'array',
      fieldset: 'nav',
      of: [
        defineField({
          name: 'homeEntry',
          title: 'Entry',
          type: 'object',
          fields: [
            defineField({
              name: 'project',
              title: 'Project',
              type: 'reference',
              to: [{type: 'project'}],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'navLabel',
              title: 'Nav label override',
              description: 'Leave empty to use the project title.',
              type: 'string',
            }),
          ],
          preview: {
            select: {label: 'navLabel', projectTitle: 'project.title'},
            prepare({label, projectTitle}: {label?: string; projectTitle?: string}) {
              return {title: label || projectTitle || 'Home entry'}
            },
          },
        }),
      ],
    }),
    fontRoleField(
      'navFont',
      'Project nav font',
      'Optional override for project links on the home page.',
      {fieldset: 'nav'},
    ),
  ],
  preview: {
    prepare() {
      return {title: 'Home page'}
    },
  },
})
