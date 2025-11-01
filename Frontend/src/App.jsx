import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Register from './components/UserRegister'
import Login from './components/UserLogin'
import HomePage from './Pages/HomePage'
import AddDob from './Pages/AddDob'
import MailConfirm from './Pages/MailConfirm'
import CreateProfile from './Pages/CreateProfile '

const router=createBrowserRouter([
  {path:'/',element:<Login/>},
  { path:'/Register',element:<Register/> },
  {path:'/Dob',element:<AddDob/>},
  {path:'/Mail',element:<MailConfirm/>},
  {path:'/Home',element:<HomePage/>},
  {path:'/profile',element:<CreateProfile/>},
])  


const App = () => {
  return <RouterProvider router={router} />
}

export default App