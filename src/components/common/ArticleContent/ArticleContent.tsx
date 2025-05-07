import React from 'react'
import ReactMarkdown from 'react-markdown'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import formatMarkdown from '@/utils/formatMarkdown'
import Article from '@/types/Article'
import styles from './ArticleContent.module.css'
import { ArrowRight } from '@mui/icons-material'
import { useDarkMode } from '@/contexts/DarkModeContext'
import LampSVG from '../../LampSVG'

const ArticleContent = React.memo(
  ({
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
            className={`text-blue-500 dark:text-blue-400 hover:text-accent-gold dark:hover:text-accent-gold flex flex-row items-center transition-all duration-300 hover:translate-x-1 ${styles.fadeIn}`}
          >
            <span>View article tree</span>
            <ArrowRight className='ml-1 transition-transform duration-300 group-hover:translate-x-1' />
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
                  className='p-15 w-full rounded-sm transition-all duration-300 hover:shadow-lg'
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
                  <h2
                    className={`${className} dark:text-gray-100 transition-all duration-300 ${styles.slideIn}`}
                    {...props}
                  >
                    {children}
                  </h2>
                )
              }
              return (
                <span className='flex flex-row items-start gap-3 w-full mt-4'>
                  <h2
                    className={`${className} dark:text-gray-100 transition-all duration-300 ${styles.slideIn}`}
                    {...props}
                  >
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
                <p
                  className={`${className} dark:text-gray-200 ${styles.fadeIn}`}
                  {...props}
                >
                  {children}
                </p>
              )
            },
            a({ node, className, children, ...props }) {
              return (
                <a
                  className={`${
                    className || ''
                  } dark:text-blue-400 hover:text-accent-gold dark:hover:text-accent-gold transition-all duration-300`}
                  {...props}
                >
                  {children}
                </a>
              )
            },
            ul({ node, className, children, ...props }) {
              return (
                <ul
                  className={`${className} dark:text-gray-200 ${styles.slideIn}`}
                  {...props}
                >
                  {children}
                </ul>
              )
            },
            ol({ node, className, children, ...props }) {
              return (
                <ol
                  className={`${className} dark:text-gray-200 ${styles.slideIn}`}
                  {...props}
                >
                  {children}
                </ol>
              )
            },
            li({ node, className, children, ...props }) {
              return (
                <li
                  className={`${className} dark:text-gray-200 transition-all duration-300 hover:translate-x-1`}
                  {...props}
                >
                  {children}
                </li>
              )
            },
            blockquote({ node, className, children, ...props }) {
              return (
                <blockquote
                  className={`${className} dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 ${styles.markdown}`}
                  {...props}
                >
                  {children}
                </blockquote>
              )
            },
            h1({ node, className, children, ...props }) {
              return (
                <h1
                  className={`${
                    className || ''
                  } dark:text-gray-100 relative inline-block ${styles.slideIn}`}
                  {...props}
                >
                  {children}
                  <span className='absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 transform-origin-left'></span>
                </h1>
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
)

ArticleContent.displayName = 'ArticleContent'

export default ArticleContent
