import React from 'react'
import NavBar from './NavBar'
import Header from './Header'
import Footer from './Footer'

const Layout = ({children}) => {
  return (
    <>
    <NavBar />
    <div className="container">
        {children}
    </div>
    </>
  )
}

export default Layout