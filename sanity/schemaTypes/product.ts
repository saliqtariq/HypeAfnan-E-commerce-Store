import {defineField, defineType} from 'sanity'
import {CATEGORIES} from '../constants'
import {SubCategoryInput} from '../components/SubCategoryInput'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'searchCode',
      title: 'Search Code',
      type: 'string',
      description: 'Unique code (e.g. 216315). Customers use this to find the product.',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: CATEGORIES,
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'subCategory',
      title: 'SubCategory',
      type: 'string',
      components: {
        input: SubCategoryInput,
      },
    }),
    defineField({
      name: 'images',
      title: 'Product Images (Max 5, each under 250KB)',
      type: 'array',
      of: [
        defineField({
          name: 'image',
          title: 'Image',
          type: 'image',
          options: {hotspot: true},
        }),
      ],
      options: {
        layout: 'grid',
      },
    }),
  ],
  preview: {
    select: {
      title: 'searchCode',
      subtitle: 'subCategory',
      media: 'images.0',
    },
    prepare({title, subtitle, media}) {
      return {
        title: `Code: ${title || 'No code'}`,
        subtitle: subtitle || 'No subcategory',
        media,
      }
    },
  },
})
