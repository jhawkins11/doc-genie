const formatMarkdown = (content: string) => {
  // trim every line
  // this is because if there is whitespace at the beginning of a line,
  // it will not render the markdown properly
  const lines = content.split('\n')
  const trimmedLines = lines.map((line) => line.trim())
  return trimmedLines.join('\n')
}

export default formatMarkdown
