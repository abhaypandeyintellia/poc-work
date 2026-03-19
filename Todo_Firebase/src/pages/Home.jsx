import React from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/login');
    }
  return (
    <div className='h-100 bg-gray-100 m-2'>
        <button onClick={handleClick} 
        className='bg-blue-500 rounded-2xl px-2 py-3 shadow-md'>
            Login
        </button>
    </div>
  )
}

export default Home