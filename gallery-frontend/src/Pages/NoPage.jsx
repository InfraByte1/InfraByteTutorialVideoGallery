import React from 'react'
import notFoundImage from '../Assets/images/404.webp'

const NoPage = () => {
  return (
    <center>
      <div className='m-5'>
       <img src={notFoundImage} alt="404"  />
      <h1>
        404 
      </h1>
      
      Page not found</div>
    </center>
  )
}

export default NoPage