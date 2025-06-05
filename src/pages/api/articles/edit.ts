import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import connectToDb from '@/utils/connectToDb'
import Article from '@/types/Article'
import { generateAIArticle } from '@/utils/generateAIArticle'
import { ArticleModel } from '@/models/ArticleModel'
import { rateLimiter } from '@/lib/backend/rateLimiter'

const requestSchema = z.object({
  editPrompt: z.string().min(1, 'Edit prompt is required'),
  _id: z.string().min(1, 'Article ID is required'),
  model: z.string().optional().nullable(),
})

type ApiResponse = Article | { error: string; message: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'method_not_allowed',
      message: 'Only POST method is allowed',
    })
  }

  try {
    // Validate request body
    const validationResult = requestSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'invalid_request',
        message: 'Invalid request body. Please check your input.',
      })
    }

    const { editPrompt, _id, model } = validationResult.data

    // Detect if user is authenticated (has Authorization header)
    const authHeader = req.headers.authorization
    const isAuthenticated = authHeader && authHeader.startsWith('Bearer ')

    // Determine user context
    const isGuest = !isAuthenticated

    // Apply rate limiting
    const rateLimitResult = await rateLimiter.checkLimit(req, 'edit', _id)
    if (!rateLimitResult.allowed) {
      console.warn(
        'Rate limit exceeded for IP:',
        req.headers['x-forwarded-for'] || req.connection?.remoteAddress
      )
      return res.status(429).json({
        error: 'rate_limit_exceeded',
        message: 'Too many edit requests. Please try again later.',
      })
    }

    // connect to mongoDb
    await connectToDb()

    const article = await ArticleModel.findById(_id)

    if (!article) {
      return res.status(404).json({
        error: 'article_not_found',
        message: 'Article not found.',
      })
    }

    const prompt = `${article.content}
        Edit Prompt: ${editPrompt}
        Return the edited article with the same format as the original and the same title.
        `

    // edit article with GPT
    const text = await generateAIArticle(prompt, model)

    if (!text || text.trim() === '') {
      return res.status(400).json({
        error: 'edit_failed',
        message: 'Failed to edit article content. Please try again.',
      })
    }

    // save edited article to mongoDb
    const edited = await ArticleModel.findByIdAndUpdate(
      _id,
      { content: text },
      { new: true }
    )

    if (!edited) {
      return res.status(500).json({
        error: 'update_failed',
        message: 'Failed to update article.',
      })
    }

    return res.status(200).json(edited)
  } catch (error) {
    console.error('Error editing article:', error)
    return res.status(500).json({
      error: 'internal_server_error',
      message: 'An unexpected error occurred. Please try again later.',
    })
  }
}
