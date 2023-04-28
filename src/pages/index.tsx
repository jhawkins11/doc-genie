const Home = () => {
  return (
    <main>
      <h1 className='p-4 logo text-4xl font-bold'>🧞 Doc Genie</h1>
      <div className='p-4 text-center space-y-4 absolute top-1/2 left-1/2 transform -translate-x-3/4 -translate-y-1/2'>
        <h2 className='p-4 text-5xl font-bold'>
          Become an expert on any subject in minutes.
        </h2>
        <h3 className='p-4 text-base font-bold'>
          Harness the power of GPT-4 and generate documentation on any topic.
          Simply enter a topic below to get started. Each subtopic can then have
          additional documentation generated to get as specific as you'd like.
        </h3>
        <div className='p-4 flex justify-center items-center space-x-4'>
          <input
            className='p-3 border-2 border-gray-300 rounded-lg w-full max-w-lg'
            type='text'
            placeholder='Ex. History of the World'
          />
          <button className='p-3 border-2 border-gray-300 rounded-lg gradient-button'>
            Learn!
          </button>
        </div>
      </div>
      <footer className='p-4 text-base font-bold absolute bottom-0'>
        Made by josiah hawkins
      </footer>
    </main>
  )
}

export default Home
