import React from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import formatMarkdown from '@/utils/formatMarkdown'
import Article from '@/types/Article'
import styles from './ArticleContent.module.css'
import { ArrowRight } from '@mui/icons-material'
import { useDarkMode } from '@/contexts/DarkModeContext'
import LampSVG from '../../LampSVG'
import Breadcrumb from '../Breadcrumb/Breadcrumb'
import { generateHeadingId } from '../OnThisPage/OnThisPage'

const ArticleContent = React.memo(
  ({
    selected,
    setArticleToGenerate,
    viewOnly,
    showLink = false,
    articles = [],
  }: {
    selected: Article
    setArticleToGenerate: (text: string | null) => void
    viewOnly?: boolean
    showLink?: boolean
    articles?: Article[]
  }) => {
    const { isDarkMode } = useDarkMode()

    if (!selected) return null
    return (
      <>
        <Breadcrumb
          selected={selected}
          articles={articles}
          isDarkMode={isDarkMode}
        />
        {showLink && (
          <Link
            href={`/${selected.slug}`}
            className={`text-blue-500 dark:text-blue-400 hover:text-accent-gold dark:hover:text-accent-gold flex flex-row items-center transition-all duration-300 hover:translate-x-1 ${styles.fadeIn}`}
          >
            <span>View article tree</span>
            <ArrowRight className='ml-1 transition-transform duration-300 group-hover:translate-x-1' />
          </Link>
        )}
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <SyntaxHighlighter
                  style={isDarkMode ? atomOneDark : docco}
                  language={match[1]}
                  PreTag='div'
                  className='p-15 w-full rounded-sm transition-all duration-300 hover:shadow-lg'
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code
                  className={`${className || ''} ${
                    isDarkMode
                      ? 'dark:bg-gray-700 dark:text-gray-100'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                  {...props}
                >
                  {children}
                </code>
              )
            },
            h1({ node, className, children, ...props }) {
              const text = String(children)
              const id = generateHeadingId(text)
              return (
                <h1
                  id={id}
                  className={`${className || ''} ${
                    isDarkMode ? 'dark:text-gray-100' : 'text-gray-900'
                  } relative inline-block ${styles.slideIn}`}
                  {...props}
                >
                  {children}
                  <span className='absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 transform-origin-left'></span>
                </h1>
              )
            },
            h2({ node, className, children, ...props }) {
              const text = String(children)
              const id = generateHeadingId(text)
              if (viewOnly) {
                return (
                  <h2
                    id={id}
                    className={`${className} ${
                      isDarkMode ? 'dark:text-gray-100' : 'text-gray-900'
                    } transition-all duration-300 ${styles.slideIn}`}
                    {...props}
                  >
                    {children}
                  </h2>
                )
              }
              return (
                <div className='flex flex-row items-center gap-3 w-full mt-4'>
                  <h2
                    id={id}
                    className={`${className} ${
                      isDarkMode ? 'dark:text-gray-100' : 'text-gray-900'
                    } transition-all duration-300 ${
                      styles.slideIn
                    } m-0 leading-tight`}
                    {...props}
                  >
                    {children}
                  </h2>
                  <button
                    className={`${styles.lampSVG}`}
                    title='Generate sub-article'
                    onClick={(e) => {
                      const text =
                        e.currentTarget.parentElement?.children[0]?.textContent
                      setArticleToGenerate(text)
                    }}
                  >
                    <LampSVG />
                  </button>
                </div>
              )
            },
            h3({ node, className, children, ...props }) {
              const text = String(children)
              const id = generateHeadingId(text)
              if (viewOnly) {
                return (
                  <h3
                    id={id}
                    className={`${className} ${
                      isDarkMode ? 'dark:text-gray-100' : 'text-gray-900'
                    } transition-all duration-300 ${styles.slideIn}`}
                    {...props}
                  >
                    {children}
                  </h3>
                )
              }
              return (
                <div className='flex flex-row items-center gap-3 w-full mt-4'>
                  <h3
                    id={id}
                    className={`${className} ${
                      isDarkMode ? 'dark:text-gray-100' : 'text-gray-900'
                    } transition-all duration-300 ${
                      styles.slideIn
                    } m-0 leading-tight`}
                    {...props}
                  >
                    {children}
                  </h3>
                  <button
                    className={`${styles.lampSVG}`}
                    title='Generate sub-article'
                    onClick={(e) => {
                      const text =
                        e.currentTarget.parentElement?.children[0]?.textContent
                      setArticleToGenerate(text)
                    }}
                  >
                    <LampSVG />
                  </button>
                </div>
              )
            },
            h4({ node, className, children, ...props }) {
              const text = String(children)
              const id = generateHeadingId(text)
              if (viewOnly) {
                return (
                  <h4
                    id={id}
                    className={`${className} ${
                      isDarkMode ? 'dark:text-gray-100' : 'text-gray-900'
                    } transition-all duration-300 ${styles.slideIn}`}
                    {...props}
                  >
                    {children}
                  </h4>
                )
              }
              return (
                <div className='flex flex-row items-center gap-3 w-full mt-4'>
                  <h4
                    id={id}
                    className={`${className} ${
                      isDarkMode ? 'dark:text-gray-100' : 'text-gray-900'
                    } transition-all duration-300 ${
                      styles.slideIn
                    } m-0 leading-tight`}
                    {...props}
                  >
                    {children}
                  </h4>
                  <button
                    className={`${styles.lampSVG}`}
                    title='Generate sub-article'
                    onClick={(e) => {
                      const text =
                        e.currentTarget.parentElement?.children[0]?.textContent
                      setArticleToGenerate(text)
                    }}
                  >
                    <LampSVG />
                  </button>
                </div>
              )
            },
            h5({ node, className, children, ...props }) {
              const text = String(children)
              const id = generateHeadingId(text)
              if (viewOnly) {
                return (
                  <h5
                    id={id}
                    className={`${className} ${
                      isDarkMode ? 'dark:text-gray-100' : 'text-gray-900'
                    } transition-all duration-300 ${styles.slideIn}`}
                    {...props}
                  >
                    {children}
                  </h5>
                )
              }
              return (
                <div className='flex flex-row items-center gap-3 w-full mt-4'>
                  <h5
                    id={id}
                    className={`${className} ${
                      isDarkMode ? 'dark:text-gray-100' : 'text-gray-900'
                    } transition-all duration-300 ${
                      styles.slideIn
                    } m-0 leading-tight`}
                    {...props}
                  >
                    {children}
                  </h5>
                  <button
                    className={`${styles.lampSVG}`}
                    title='Generate sub-article'
                    onClick={(e) => {
                      const text =
                        e.currentTarget.parentElement?.children[0]?.textContent
                      setArticleToGenerate(text)
                    }}
                  >
                    <LampSVG />
                  </button>
                </div>
              )
            },
            h6({ node, className, children, ...props }) {
              const text = String(children)
              const id = generateHeadingId(text)
              if (viewOnly) {
                return (
                  <h6
                    id={id}
                    className={`${className} ${
                      isDarkMode ? 'dark:text-gray-100' : 'text-gray-900'
                    } transition-all duration-300 ${styles.slideIn}`}
                    {...props}
                  >
                    {children}
                  </h6>
                )
              }
              return (
                <div className='flex flex-row items-center gap-3 w-full mt-4'>
                  <h6
                    id={id}
                    className={`${className} ${
                      isDarkMode ? 'dark:text-gray-100' : 'text-gray-900'
                    } transition-all duration-300 ${
                      styles.slideIn
                    } m-0 leading-tight`}
                    {...props}
                  >
                    {children}
                  </h6>
                  <button
                    className={`${styles.lampSVG}`}
                    title='Generate sub-article'
                    onClick={(e) => {
                      const text =
                        e.currentTarget.parentElement?.children[0]?.textContent
                      setArticleToGenerate(text)
                    }}
                  >
                    <LampSVG />
                  </button>
                </div>
              )
            },
            p({ node, className, children, ...props }) {
              return (
                <p
                  className={`${className} ${
                    isDarkMode ? 'dark:text-gray-200' : 'text-gray-700'
                  } ${styles.fadeIn}`}
                  {...props}
                >
                  {children}
                </p>
              )
            },
            a({ node, className, children, ...props }) {
              return (
                <a
                  className={`${className || ''} ${
                    isDarkMode
                      ? 'dark:text-blue-400 hover:text-accent-gold dark:hover:text-accent-gold'
                      : 'text-blue-600 hover:text-accent-gold'
                  } transition-all duration-300`}
                  {...props}
                >
                  {children}
                </a>
              )
            },
            ul({ node, className, children, ...props }) {
              return (
                <ul
                  className={`${className} ${
                    isDarkMode ? 'dark:text-gray-200' : 'text-gray-700'
                  } ${styles.slideIn}`}
                  {...props}
                >
                  {children}
                </ul>
              )
            },
            ol({ node, className, children, ...props }) {
              return (
                <ol
                  className={`${className} ${
                    isDarkMode ? 'dark:text-gray-200' : 'text-gray-700'
                  } ${styles.slideIn}`}
                  {...props}
                >
                  {children}
                </ol>
              )
            },
            li({ node, className, children, ...props }) {
              return (
                <li
                  className={`${className} ${
                    isDarkMode ? 'dark:text-gray-200' : 'text-gray-700'
                  }`}
                  {...props}
                >
                  {children}
                </li>
              )
            },
            blockquote({ node, className, children, ...props }) {
              return (
                <blockquote
                  className={`${className} ${
                    isDarkMode
                      ? 'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
                      : 'bg-gray-50 border-gray-300 text-gray-700'
                  } ${styles.markdown}`}
                  {...props}
                >
                  {children}
                </blockquote>
              )
            },
            table({ node, className, children, ...props }) {
              return (
                <div
                  className={`${styles.tableWrapper} ${styles.fadeIn} ${
                    isDarkMode
                      ? styles.darkTableWrapper
                      : styles.lightTableWrapper
                  }`}
                >
                  <table
                    className={`${className || ''} ${styles.table}`}
                    {...props}
                  >
                    {children}
                  </table>
                </div>
              )
            },
            thead({ node, className, children, ...props }) {
              return (
                <thead
                  className={`${className || ''} ${styles.tableHead}`}
                  {...props}
                >
                  {children}
                </thead>
              )
            },
            tbody({ node, className, children, ...props }) {
              return (
                <tbody
                  className={`${className || ''} ${styles.tableBody}`}
                  {...props}
                >
                  {children}
                </tbody>
              )
            },
            tr({ node, className, children, ...props }) {
              return (
                <tr
                  className={`${className || ''} ${styles.tableRow} ${
                    isDarkMode ? styles.darkTableRow : styles.lightTableRow
                  }`}
                  {...props}
                >
                  {children}
                </tr>
              )
            },
            th({ node, className, children, ...props }) {
              return (
                <th
                  className={`${className || ''} ${styles.tableHeader} ${
                    isDarkMode
                      ? styles.darkTableHeader
                      : styles.lightTableHeader
                  }`}
                  {...props}
                >
                  {children}
                </th>
              )
            },
            td({ node, className, children, ...props }) {
              return (
                <td
                  className={`${className || ''} ${styles.tableCell} ${
                    isDarkMode ? styles.darkTableCell : styles.lightTableCell
                  }`}
                  {...props}
                >
                  {children}
                </td>
              )
            },
          }}
          remarkPlugins={[remarkGfm]}
        >
          {formatMarkdown(selected.content)}
        </ReactMarkdown>
      </>
    )
  }
)

ArticleContent.displayName = 'ArticleContent'

export default ArticleContent
