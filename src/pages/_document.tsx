import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
        <link
          href='https://fonts.googleapis.com/css2?family=Darumadrop+One&display=swap'
          rel='stylesheet'
        />
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta
          name='description'
          content='A brief description of your website'
        ></meta>
        <link rel='icon' href='/doc-genie.ico'></link>
        <link rel='apple-touch-icon' href='/logo.png'></link>
        <meta property='og:title' content='Doc Genie' />
        <meta
          property='og:description'
          content='Generate expert documentation trees in minutes with GPT.'
        />
        <meta property='og:image' content='/screenshot-1.png' />
        <meta property='og:url' content='https://doc-genie-6b615.web.app/' />
        <meta name='twitter:title' content='Doc Genie' />
        <meta
          name='twitter:description'
          content='Generate expert documentation trees in minutes with GPT.'
        />
        <meta name='twitter:image' content='/logo.png' />
        <meta name='twitter:card' content='summary_large_image' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
