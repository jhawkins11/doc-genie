import { Model } from 'mongoose'

const createUniqueSlug = async ({
  title,
  model,
}: {
  title: string
  model: Model<any>
}): Promise<string> => {
  const slug = title.toLowerCase().replace(/ /g, '-')

  // find all existing rows with the same base slug
  const existing = await model.find({
    slug: { $regex: new RegExp(`^${slug}(-[0-9]*)?$`, 'i') },
  })
  // if there are existing rows with the same slug, add a number to the end of the slug
  // the number will be the number of existing articles with the same slug
  if (existing.length > 0) {
    const lastSlug = existing[existing.length - 1].slug
    const lastSlugNumber = parseInt(lastSlug.split('-').pop())
    return `${slug}-${lastSlugNumber + 1}`
  }
  return slug
}

export default createUniqueSlug
