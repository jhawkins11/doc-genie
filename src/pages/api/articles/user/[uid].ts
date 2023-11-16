import type { NextApiRequest, NextApiResponse } from 'next'
import connectToDb from '@/utils/connectToDb'
import Article from '@/types/Article'
import { ArticleModel } from '@/models/ArticleModel'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Article[] | { message: string }>
): Promise<void> {
  const { uid } = req.query
  try {
    // connect to mongoDb
    await connectToDb()

    // fetch top level articles for user
    const articles = await ArticleModel.find({ uid, parentid: '' })

    return res.status(200).json(articles)
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: `Error fetching article: ${(error as any).message}` })
  }
}
