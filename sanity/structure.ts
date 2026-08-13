import {StructureResolver} from 'sanity/structure'
import {CATEGORIES} from './constants'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Categories')
    .items([
      ...CATEGORIES.map((category) =>
        S.listItem()
          .title(category)
          .child(
            S.documentList()
              .title(`Products in ${category}`)
              .filter('_type == "product" && category == $category')
              .params({category})
              .initialValueTemplates([
                S.initialValueTemplateItem('product-by-category', {categoryId: category}),
              ])
          )
      ),
      S.divider(),
      S.documentTypeListItem('subCategory').title('Manage SubCategories'),
    ])
