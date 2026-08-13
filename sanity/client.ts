import {createClient} from 'next-sanity'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-08-13',
  useCdn: false, // false = always fresh data, no CDN delay
})

export async function getSanityProducts() {
  const query = `*[_type == "product"]{
    _id,
    searchCode,
    category,
    subCategory,
    "images": images[].asset->url
  }`
  return sanityClient.fetch(query, {}, { cache: 'no-store' })
}
