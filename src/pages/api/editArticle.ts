import type { NextApiRequest, NextApiResponse } from 'next'
import connectToDb from '@/utils/connectToDb'
import Article from '@/types/Article'
import { generateAIArticle } from '@/utils/generateAIArticle'
import { ArticleModel } from '@/models/ArticleModel'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Article | { message: string }>
): Promise<void> {
  const { editPrompt, _id } = req.body
  try {
    // connect to mongoDb
    await connectToDb()

    const article = await ArticleModel.findById(_id)

    const prompt = `${article?.content}
        Edit Prompt: ${editPrompt}
        Return the edited article with the same format as the original and the same title.
        `

    // edit article with GPT
    const text = await generateAIArticle(prompt)
    // create a unique slug for the article
    // if the article is a child article, we don't need to create a slug=
    // save edited article to mongoDb
    const edited = await ArticleModel.updateOne(
      { _id },
      {
        content: text,
      }
    )

    return res.status(200).json(edited as any)
  } catch (error) {
    return res.status(500).json({ message: 'Error generating article' })
  }
}
