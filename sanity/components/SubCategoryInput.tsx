import { useCallback } from 'react'
import { Select } from '@sanity/ui'
import { StringInputProps, useFormValue, set, unset } from 'sanity'
import categoriesData from '../../app/data/categories.json'

export function SubCategoryInput(props: StringInputProps) {
  const { value, onChange } = props
  const categoryName = useFormValue(['category']) as string

  // Find subcategories based on selected categoryName
  const group = categoriesData.find((g: any) => g.groupName === categoryName)
  const subCategories = group ? group.tags.map((t: any) => t.tagName) : []

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextValue = event.currentTarget.value
      onChange(nextValue ? set(nextValue) : unset())
    },
    [onChange]
  )

  return (
    <Select value={value || ''} onChange={handleChange}>
      <option value="">--- Select SubCategory ---</option>
      {subCategories.map((sub: string) => (
        <option key={sub} value={sub}>
          {sub}
        </option>
      ))}
    </Select>
  )
}
