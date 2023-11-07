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
  const { parentid, topic, subtopic } = req.body
  try {
    // connect to mongoDb
    await connectToDb()

    // generate article with GPT
    const { title, text } = await generateAIArticle(topic, subtopic)
    // create a unique slug for the article
    // if the article is a child article, we don't need to create a slug
    let slug = ''
    if (!parentid) {
      slug = await createUniqueSlug({ title, model: ArticleModel })
    }
    // save article to mongoDb
    const created = await ArticleModel.create({
      parentid: parentid || '',
      title,
      content: text,
      slug,
    })
    return res.status(200).json(created as any)
  } catch (error) {
    return res.status(500).json({ message: 'Error generating article' })
  }
}
