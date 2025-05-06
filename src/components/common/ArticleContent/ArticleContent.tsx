import formatMarkdown from '@/utils/formatMarkdown'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import LampSVG from '../../LampSVG'
import Article from '@/types/Article'
import styles from './ArticleContent.module.css'
import { ArrowRight } from '@mui/icons-material'
import { useDarkMode } from '@/contexts/DarkModeContext'

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
  const { isDarkMode } = useDarkMode()

  if (!selected) return null
  return (
    <>
      {showLink && (
        <a
          href={`/${selected.slug}`}
          rel='noopener noreferrer'
          className='text-blue-500 dark:text-blue-400 hover:text-accent-gold dark:hover:text-accent-gold flex flex-row items-center'
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
                style={isDarkMode ? atomOneDark : (docco as any)}
                language={match[1]}
                PreTag='div'
                className='p-15 w-full rounded-sm'
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code
                className={`${className} dark:bg-gray-700 dark:text-gray-100`}
                {...props}
              >
                {children}
              </code>
            )
          },
          h2({ node, className, children, ...props }) {
            if (viewOnly) {
              return (
                <h2 className={`${className} dark:text-gray-100`} {...props}>
                  {children}
                </h2>
              )
            }
            return (
              <span className='flex flex-row items-start gap-3 w-full mt-4'>
                <h2 className={`${className} dark:text-gray-100`} {...props}>
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
          p({ node, className, children, ...props }) {
            return (
              <p className={`${className} dark:text-gray-200`} {...props}>
                {children}
              </p>
            )
          },
          a({ node, className, children, ...props }) {
            return (
              <a
                className={`${
                  className || ''
                } dark:text-blue-400 hover:text-accent-gold dark:hover:text-accent-gold`}
                {...props}
              >
                {children}
              </a>
            )
          },
          ul({ node, className, children, ...props }) {
            return (
              <ul className={`${className} dark:text-gray-200`} {...props}>
                {children}
              </ul>
            )
          },
          ol({ node, className, children, ...props }) {
            return (
              <ol className={`${className} dark:text-gray-200`} {...props}>
                {children}
              </ol>
            )
          },
          li({ node, className, children, ...props }) {
            return (
              <li className={`${className} dark:text-gray-200`} {...props}>
                {children}
              </li>
            )
          },
          blockquote({ node, className, children, ...props }) {
            return (
              <blockquote
                className={`${className} dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300`}
                {...props}
              >
                {children}
              </blockquote>
            )
          },
        }}
        className={`grid grid-cols-1 gap-4 w-full ${
          isDarkMode ? styles.darkMode : ''
        }`}
      >
        {formatMarkdown(selected.content)}
      </ReactMarkdown>
    </>
  )
}

export default ArticleContent
