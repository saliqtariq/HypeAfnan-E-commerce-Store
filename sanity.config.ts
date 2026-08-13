import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './sanity/schemaTypes'
import {projectId, dataset} from './sanity/env'
import {structure} from './sanity/structure'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  title: 'HypeAfnan CMS',
  schema: {
    types: schemaTypes,
    templates: (templates) => [
      ...templates,
      {
        id: 'product-by-category',
        title: 'Product by Category',
        schemaType: 'product',
        parameters: [{name: 'categoryId', type: 'string'}],
        value: (params: any) => ({
          category: params.categoryId,
        }),
      },
    ],
  },
  plugins: [structureTool({structure})],
})
