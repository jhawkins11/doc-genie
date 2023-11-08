import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const generateAIArticle = async (prompt: string): Promise<string> => {
  let completions
  try {
    // generate completions
    completions = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 2048,
      n: 1,
      temperature: 0.3,
    })
  } catch (error) {
    console.log('error generating completions', error)
    throw new Error(error as string)
  }

  const text = completions.choices[0].message.content as string

  return text
}
