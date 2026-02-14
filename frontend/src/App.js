import React from 'react'
import './App.css';
import Dashbord from './component/Dashbord'
import Login from './component/login';
import { Route, Routes } from 'react-router-dom';
import Stagiaire from './component/Stagiaire'
const App = () => {
  return (
    <>
      <Routes>
        <Route
        path='*'
        element={<Login/>}
        />
        <Route 
        path='/admin' 
        element={<Dashbord/>}
        />
        <Route 
        path='/stagiaire' 
        element={<Stagiaire/>}
        />
      </Routes>
    </>
  )
}

export default App