import React from 'react'
import { useAuth } from '../hooks/useAuth'

const Dashboard = () => {

    const {logout, user} = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.log(error.message);
        }
    }

  return (
    <div className='flex flex-col justify-center items-center'>
        <div>
            <p>{user.uid}</p>
            <button className='bg-blue-500 text-white font-semibold text-md rounded-2xl py-2 px-3 m-2' onClick={handleLogout}>Log Out</button>
        </div>
        <div>
            <ul>
                
            </ul>
        </div>
    </div>
  )
}

export default Dashboard;