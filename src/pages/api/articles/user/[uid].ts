import type { NextApiRequest, NextApiResponse } from 'next'
import connectToDb from '@/utils/connectToDb'
import Article from '@/types/Article'
import { ArticleModel } from '@/models/ArticleModel'
import {
  requireAuthentication,
  AuthenticationError,
} from '@/lib/backend/authService'
import buildArticleTree from '@/utils/buildArticleTree'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Article[] | { error: string; message: string }>
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'method_not_allowed',
      message: 'Only GET method is allowed',
    })
  }

  try {
    const authenticatedUser = await requireAuthentication(req)

    const { uid } = req.query

    // Ensure the authenticated user can only access their own data
    if (authenticatedUser.uid !== uid) {
      return res.status(403).json({
        error: 'forbidden',
        message: 'You can only access your own articles',
      })
    }

    await connectToDb()

    const topLevelArticles = await ArticleModel.find({ uid, parentid: '' })

    const articlesWithChildren = await Promise.all(
      topLevelArticles.map((article) => buildArticleTree(article))
    )

    return res.status(200).json(articlesWithChildren)
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return res.status(error.statusCode).json({
        error: error.code,
        message: error.message,
      })
    }

    console.error('Error fetching user articles:', error)
    return res.status(500).json({
      error: 'internal_server_error',
      message: 'An unexpected error occurred while fetching articles',
    })
  }
}
