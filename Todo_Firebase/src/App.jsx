import { useState } from 'react';
import './App.css';
import { Routes, Route, Router, BrowserRouter } from 'react-router-dom';
import {Login} from './pages/Login'
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './routes/PrivateRoute';
import Home from './pages/Home';
import { Toaster } from 'react-hot-toast';

function App() {

  return (
    <>
    <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route element={<PrivateRoute/>}>
          <Route path='/dashboard' element={<Dashboard />}/>
        </Route>
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;