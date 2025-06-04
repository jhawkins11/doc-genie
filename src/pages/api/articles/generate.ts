import mongoose from 'mongoose'
import type { NextApiRequest, NextApiResponse } from 'next'
import connectToDb from '@/utils/connectToDb'
import Article from '@/types/Article'
import { generateAIArticle } from '@/utils/generateAIArticle'
import { ArticleModel } from '@/models/ArticleModel'
import createUniqueSlug from '@/utils/createUniqueSlug'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Article | { message: string }>
): Promise<void> {
  const { parentid, topic, subtopic, uid, model } = req.body
  try {
    // connect to mongoDb
    await connectToDb()

    // Check if we're generating a subarticle (has parentid and subtopic)
    if (parentid && subtopic) {
      // Check if a similar subarticle already exists under this parent
      const normalizedSubtopic = subtopic.trim().toLowerCase()
      const parent = await ArticleModel.findById(parentid).populate(
        'childArticles'
      )

      if (parent && parent.childArticles && parent.childArticles.length > 0) {
        // Look for any similar titles
        const existingSimilar = parent.childArticles.find((child: any) => {
          const childTitle = child.title.toLowerCase()
          return (
            childTitle === normalizedSubtopic ||
            childTitle.includes(normalizedSubtopic) ||
            normalizedSubtopic.includes(childTitle)
          )
        })

        if (existingSimilar) {
          return res.status(200).json(existingSimilar as any)
        }
      }
    }

    const prompt = subtopic
      ? `
      Generate MDL Subarticle in markdown format.
      Parent Topic for context: ${topic}
      Article Title: ${subtopic}
      Format: 1 h1/2+ h2s
      h2s should be relevant subtopics to the article being generated.
      `
      : `
        Generate MDL Article in markdown format.
        Article Title: ${topic}
        Format: 1 h1/2+ h2s
        h2s should be relevant subtopics to the article being generated.
        `

    // generate article with GPT
    const text = await generateAIArticle(prompt, model)

    // If no content was generated, return an error
    if (!text || text.trim() === '') {
      return res.status(400).json({
        message: 'Failed to generate article content. Please try again.',
      })
    }

    //  title is the generated heading
    const title = text.match(/# (.*)\n/)
      ? text.match(/# (.*)\n/)?.[1]
      : subtopic || topic

    // create a unique slug for the article
    // if the article is a child article, we don't need to create a slug
    let slug = ''
    slug = await createUniqueSlug({ title, model: ArticleModel })

    // save article to mongoDb
    const created = await ArticleModel.create({
      parentid: parentid || '',
      title,
      content: text,
      slug,
      uid,
    })

    // If this is a subarticle, add it to the parent's childArticles array
    if (parentid) {
      await ArticleModel.findByIdAndUpdate(parentid, {
        $push: { childArticles: created._id },
      })
    }

    return res.status(200).json(created as any)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: `Error generating article: ${(error as any).message}` })
  }
}
