import { Model, Document } from 'mongoose'

interface HasSlug {
  slug: string
}

const createUniqueSlug = async <T extends Document & HasSlug>({
  title,
  model,
}: {
  title: string
  model: Model<T>
}): Promise<string> => {
  // Create a base slug by removing special characters and replacing spaces with hyphens
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()

  // find all existing rows with the same base slug
  const existing = await model.find({
    slug: { $regex: new RegExp(`^${baseSlug}(-[0-9]+)?$`, 'i') },
  })

  // If no duplicates found, return the base slug
  if (existing.length === 0) {
    return baseSlug
  }

  // Find the highest number suffix among existing slugs
  let highestNumber = 0

  for (const item of existing) {
    const slugParts = item.slug.split('-')
    const lastPart = slugParts[slugParts.length - 1]
    const number = parseInt(lastPart)

    // Check if the last part is actually a number
    if (!isNaN(number)) {
      highestNumber = Math.max(highestNumber, number)
    }
  }

  // Return the slug with incremented number
  return `${baseSlug}-${highestNumber + 1}`
}

export default createUniqueSlug
