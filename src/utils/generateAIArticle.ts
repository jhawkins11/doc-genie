import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const generateAIArticle = async (
  topic: string,
  subtopic?: string
): Promise<{ title: string; text: string }> => {
  const prompt = subtopic
    ? `
      Generate MDL Subarticle in a format that works with react-markdown. Don't use any special characters that will not be formatted correctly.
      Parent Topic for context: ${topic}
      Article Title: ${subtopic}
      Format: 1 h1/2+ h2s
    `
    : `
    Generate MDL Article in a format that works with react-markdown: ${topic}
    Format: 1 h1/2+ h2s
  `

  let completions
  try {
    // generate completions
    completions = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
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

  //  title is the generated heading
  const title = text.match(/# (.*)\n/)
    ? text.match(/# (.*)\n/)?.[1]
    : subtopic || topic

  return { title, text }
}
