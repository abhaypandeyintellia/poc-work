import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {

    const navigate = useNavigate();

    const {register} = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await register(email, password);
            navigate('/dashboard');
        } catch (err) {
            console.log(err.message);
        }
    }

  return (
    <div>
        <form>
            <div>
                <input type="text"
                placeholder='Enter email'
                onChange={(e)=>setEmail(e.target.value)}
                value={email}
                />
            </div>

            <div>
                <input type="password"
                placeholder='Enter password'
                onChange={(e)=>setPassword(e.target.value)}
                value={password}
                />
            </div>

            <button className='bg-blue-500 text-white font-semibold text-md rounded-2xl py-2 px-3 m-2' onClick={handleRegister}>Sign Up</button>
        </form>
    </div>
  )
}

export default SignUp