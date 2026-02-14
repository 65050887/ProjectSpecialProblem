// rafce
import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  // body function = code javascript
  



  // code jsx = code html ที่สามารถแทรก js ลงไปได้
  // กฎ return สามารถ return ออกมาได้แค่ 1 element เท่านั้น
  // ถ้ามากกว่า 1 element ต้องห่อด้วย tag เดียว เช่น div, section หรือใช้ fragment <> เปล่า ๆ ครอบก็ได้ จะได้เท่ากับ 1 element
  return (
    <>
      <ToastContainer />
      <AppRoutes/>
    </>
  )
}

export default App