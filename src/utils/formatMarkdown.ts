const formatMarkdown = (content: string) => {
  // trim every line
  // this is because if there is whitespace at the beginning of a line,
  // it will not render the markdown properly
  const lines = content.split('\n')
  let isCodeBlock = false
  const trimmedLines = lines.map((line, index) => {
    // if line is within a multiline code block, don't trim it
    if (line.startsWith('```markdown')) {
      isCodeBlock = !isCodeBlock
      if (index === 0) {
        // remove the starting code block
        return line.replace('```markdown', '')
      }
      return line
    }
    if (isCodeBlock && line.endsWith('```')) {
      isCodeBlock = !isCodeBlock
      if (index === lines.length - 1) {
        // remove the ending code block
        return line.replace('```', '')
      }
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
