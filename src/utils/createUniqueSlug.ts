import { Model } from 'mongoose'

const createUniqueSlug = async ({
  title,
  model,
}: {
  title: string
  model: Model<any>
}): Promise<string> => {
  const slug = title.toLowerCase().replace(/ /g, '-')

  // find all existing rows with the same slug
  const existing = await model.find({
    slug,
  })
  // if there are existing rows with the same slug, add a number to the end of the slug
  // the number will be the number of existing articles with the same slug
  if (existing.length > 0) {
    const newSlug = `${slug}-${existing.length}`
    // update the article with the new slug
    return newSlug
  }
  return slug
}

export default createUniqueSlug
