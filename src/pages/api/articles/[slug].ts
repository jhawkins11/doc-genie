import mongoose, { Document } from 'mongoose'
import type { NextApiRequest, NextApiResponse } from 'next'
import connectToDb from '@/utils/connectToDb'
import Article from '@/types/Article'
import { ArticleModel } from '@/models/ArticleModel'
import buildArticleTree from '@/utils/buildArticleTree'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Article | { message: string }>
): Promise<void> {
  const { slug } = req.query
  try {
    // connect to mongoDb
    await connectToDb()

    // fetch article
    const article = await ArticleModel.findOne({ slug })

    // recursively fetch child articles
    const articleWithChildren = await buildArticleTree(article)

    return res.status(200).json(articleWithChildren)
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: `Error fetching article: ${(error as any).message}` })
  }
}
