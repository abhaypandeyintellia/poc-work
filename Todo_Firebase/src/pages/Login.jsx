import React, {useState} from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import showAuthErrorToast from '../utils/showAuthErrorToast';

export const Login = () => {

    const navigate = useNavigate();
    const { login, loginWithGoogle } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            if(email.trim() === '' || password.trim() === ''){
                return alert("Fields cannot be empty");
            }
        await login(email, password);
        navigate('/dashboard');
    } catch (err) {
      showAuthErrorToast(err);
    }
    }

    const handleLoginWithGoogle = async (e) => {
        e.preventDefault();
        try {
        await loginWithGoogle();
        
        navigate('/dashboard');
    } catch (err) {
      showAuthErrorToast(err);
    }
    }

    const handleClick = () => {
        navigate('/signup');
    }


  return (
    <div className='flex flex-col'>
        <form className='flex-1'>
            <div>
                <input type="text"
                placeholder='Enter email'
                onChange={(e)=>setEmail(e.target.value)}
                value={email}
                className='bg-gray-100 rounded-2xl py-2 px-3 m-2 outline-blue-500'
                />
            </div>

            <div>
                <input type="password"
                placeholder='Enter password'
                onChange={(e)=>setPassword(e.target.value)}
                value={password}
                className='bg-gray-100 rounded-2xl py-2 px-3 m-2 outline-blue-500'
                />
            </div>

            <button className='bg-blue-500 text-white font-semibold text-md rounded-2xl py-2 px-3 m-2' onClick={handleLoginWithGoogle}>Log In With Google</button>
            <button className='bg-blue-500 text-white font-semibold text-md rounded-2xl py-2 px-3 m-2' onClick={handleLogin}>Log In</button>
            <span className='text-sm font-light text-blue-600 px-3 py-2' onClick={handleClick}>Register Here</span>
        </form>
    </div>
  );
};
