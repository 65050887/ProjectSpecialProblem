// client\src\layouts\Layout.jsx 
import React from 'react'
import { Outlet } from 'react-router-dom'
import MainNav from '../components/MainNav'

const Layout = () => {
  return (
    <div className='min-h-screen bg-white'>
      <MainNav />
        <Outlet />
    </div>
  )
}

export default Layout