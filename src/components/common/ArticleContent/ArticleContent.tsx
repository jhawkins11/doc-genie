import formatMarkdown from '@/utils/formatMarkdown'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import LampSVG from '../../LampSVG'
import Article from '@/types/Article'
import styles from './ArticleContent.module.css'
import { ArrowRight } from '@mui/icons-material'

const ArticleContent = ({
  selected,
  setArticleToGenerate,
  viewOnly,
  showLink = false,
}: {
  selected: Article
  setArticleToGenerate: (text: string | null) => void
  viewOnly?: boolean
  showLink?: boolean
}) => {
  if (!selected) return null
  return (
    <>
      {showLink && (
        <a
          href={`/${selected.slug}`}
          rel='noopener noreferrer'
          className='text-gray-400 flex flex-row items-center gap-2'
        >
          <span>View article tree</span>
          <ArrowRight />
        </a>
      )}
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                style={atomOneDark as any}
                language={match[1]}
                PreTag='div'
                className='p-15 w-full rounded-sm'
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
          h2({ node, className, children, ...props }) {
            if (viewOnly) {
              return (
                <h2 className={className} {...props}>
                  {children}
                </h2>
              )
            }
            return (
              <span className='flex flex-row items-start gap-3 w-full mt-4'>
                <h2 className={className} {...props}>
                  {children}
                </h2>
                <button
                  className={styles.lampSVG}
                  title='Generate sub-article'
                  onClick={(e) => {
                    const text =
                      e.currentTarget.parentElement.children[0].textContent
                    setArticleToGenerate(text)
                  }}
                >
                  <LampSVG />
                </button>
              </span>
            )
          },
        }}
        className='grid grid-cols-1 gap-4 w-full'
      >
        {formatMarkdown(selected.content)}
      </ReactMarkdown>
    </>
  )
}

export default ArticleContent
