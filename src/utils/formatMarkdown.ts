const formatMarkdown = (content: string) => {
  // trim every line
  // this is because if there is whitespace at the beginning of a line,
  // it will not render the markdown properly
  const lines = content.split('\n')
  let isCodeBlock = false
  const trimmedLines = lines.map((line) => {
    // if line is within a multiline code block, don't trim it
    if (line.startsWith('```')) {
      isCodeBlock = !isCodeBlock
      return line
    }
    if (isCodeBlock && line.endsWith('```')) {
      isCodeBlock = !isCodeBlock
      return line
    }
    if (isCodeBlock) {
      return line
    }
    return line.trim()
  })
  return trimmedLines.join('\n')
}

export default formatMarkdown
