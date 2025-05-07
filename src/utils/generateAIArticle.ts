import axios from 'axios'

export const generateAIArticle = async (
  prompt: string,
  model: string
): Promise<string> => {
  try {
    // Adjust prompt for specific models
    let modifiedPrompt = prompt

    // For Perplexity models, explicitly request no citations
    if (model.startsWith('perplexity/')) {
      modifiedPrompt = `${prompt}\n\nPlease do not include any citations, references, or numbered markers like [1], [2], etc. in your response.`
    }

    // OpenRouter endpoint
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model,
        messages: [
          {
            role: 'user',
            content: modifiedPrompt,
          },
        ],
        max_tokens: 2048,
        n: 1,
        temperature: 0.5,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer':
            process.env.OPENROUTER_HTTP_REFERER ||
            'https://doc-genie.vercel.app',
          'X-Title': process.env.OPENROUTER_X_TITLE || 'Doc-Genie',
        },
      }
    )

    let text = response.data.choices[0].message.content

    // Post-process for specific models
    if (model.startsWith('perplexity/')) {
      // Remove citation markers like [1], [2], etc.
      text = text.replace(/\[\d+\]/g, '')

      // Remove any sections titled "References", "Citations", etc.
      const referenceHeaders = [
        '## References',
        '### References',
        '## Citations',
        '### Citations',
        '## Sources',
        '### Sources',
      ]

      for (const header of referenceHeaders) {
        const headerIndex = text.indexOf(header)
        if (headerIndex !== -1) {
          text = text.substring(0, headerIndex).trim()
        }
      }

      // Clean up any double spaces created by removing citations
      text = text.replace(/  +/g, ' ')
    }

    return text
  } catch (error) {
    console.log('Error generating completions:', error)
    throw new Error((error as any).message || 'Error generating article')
  }
}
