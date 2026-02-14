import React from 'react'
import { Outlet } from 'react-router-dom'
import SidebarAdmin from '../components/admin/SidebarAdmin'
import HeaderbarAdmin from '../components/admin/HeaderbarAdmin'

const LayoutAdmin = () => {
  return (
    <div className='flex h-screen'>
        <SidebarAdmin/>

        <div className='flex-1 flex-col'>
          <HeaderbarAdmin/>
          <main className='flex-1 p-6 bg-gray-200 overflow-y-auto'>
            <Outlet/>
          </main>
        </div>

    </div>
  )
}

export default LayoutAdmin