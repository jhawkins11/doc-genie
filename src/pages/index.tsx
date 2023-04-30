import LampCanvas from '@/components/canvas/Lamp'

const Home = () => {
  return (
    <main>
      <div className='stars'></div>
      <div className='twinkling'></div>
      <div className='clouds'></div>
      <h1 className='p-4 logo text-4xl font-bold'>🧞 Doc Genie</h1>
      <div className='p-4 text-center space-y-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-2/3'>
        <h2 className='p-4 text-5xl font-bold'>
          Become an expert on any subject in{' '}
          <span className='bg-white px-1 bg-opacity-30 leading-normal'>
            minutes
          </span>
          .
        </h2>
        <h3 className='p-4 text-base font-bold'>
          Harness the power of GPT-4 and generate documentation on any topic.
          Simply enter a topic below to get started. Each subtopic can then have
          additional documentation generated to get as specific as you&#39;d
          like.
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
      {/* lamp 3d model behind hero text */}
      <div className='p-4 absolute top-0 left-0 w-full h-full -z-10'>
        <LampCanvas />
      </div>
      <footer className='p-4 text-xs font-bold absolute bottom-0'>
        <p>Made by josiah hawkins</p>
        <p>
          3D model by{' '}
          <a href='https://sketchfab.com/RafaelScopel'>RafaelScopel</a>
        </p>
      </footer>
    </main>
  )
}

export default Home
