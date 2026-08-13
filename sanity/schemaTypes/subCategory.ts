import {defineField, defineType} from 'sanity'
import {CATEGORIES} from '../constants'

export default defineType({
  name: 'subCategory',
  title: 'SubCategory',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'SubCategory Title (e.g., LV Men Clothes)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'parentCategory',
      title: 'Parent Category',
      type: 'string',
      options: {
        list: CATEGORIES,
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'SubCategory Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
  ],
})
