import mongoose from 'mongoose'
import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import connectToDb from '@/utils/connectToDb'
import Article from '@/types/Article'
import { generateAIArticle } from '@/utils/generateAIArticle'
import { ArticleModel } from '@/models/ArticleModel'
import createUniqueSlug from '@/utils/createUniqueSlug'
import { rateLimiter } from '@/lib/backend/rateLimiter'

const requestSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  subtopic: z.string().optional().nullable(),
  parentid: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  uid: z.string().optional().nullable(),
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

    const { parentid, topic, subtopic, uid, model } = validationResult.data

    // Determine user context based on uid in request body
    const isAuthenticated = !!uid
    const isGuest = !isAuthenticated

    // Apply rate limiting for all users (different limits for guest vs authenticated)
    const endpoint = isGuest ? 'generate' : 'authenticated'
    const rateLimitResult = await rateLimiter.checkLimit(
      req,
      endpoint,
      undefined,
      uid || undefined
    )
    if (!rateLimitResult.allowed) {
      const message = isGuest
        ? 'Too many requests from this IP. Guest users are limited to 2 article generations per day.'
        : 'Too many requests. Authenticated users are limited to 5 article generations per day.'

      console.warn(
        'Rate limit exceeded for:',
        isGuest ? 'guest IP' : 'authenticated user'
      )
      return res.status(429).json({
        error: 'rate_limit_exceeded',
        message,
      })
    }

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
        const existingSimilar = parent.childArticles.find((child: Article) => {
          const childTitle = child.title.toLowerCase()
          return (
            childTitle === normalizedSubtopic ||
            childTitle.includes(normalizedSubtopic) ||
            normalizedSubtopic.includes(childTitle)
          )
        })

        if (existingSimilar) {
          return res.status(200).json(existingSimilar)
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
        error: 'generation_failed',
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
      uid: uid || undefined,
      isGuest,
    })

    // If this is a subarticle, add it to the parent's childArticles array
    if (parentid) {
      await ArticleModel.findByIdAndUpdate(parentid, {
        $push: { childArticles: created._id },
      })
    }

    return res.status(201).json(created)
  } catch (error) {
    console.error('Error generating article:', error)
    return res.status(500).json({
      error: 'internal_server_error',
      message: 'An unexpected error occurred. Please try again later.',
    })
  }
}
