import mongoose from 'mongoose'
import OpenAI from 'openai'
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
  const { parentid, topic, subtopic, uid } = req.body
  try {
    // connect to mongoDb
    await connectToDb()

    const prompt = subtopic
      ? `
      Generate MDL Subarticle in a format that works with react-markdown.
      Parent Topic for context: ${topic}
      Article Title: ${subtopic}
      Format: 1 h1/2+ h2s
      `
      : `
        Generate MDL Article in a format that works with react-markdown.
        Article Title: ${topic}
        Format: 1 h1/2+ h2s
        `

    // generate article with GPT
    const text = await generateAIArticle(prompt)
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
    return res.status(200).json(created as any)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: `Error generating article: ${(error as any).message}` })
  }
}
