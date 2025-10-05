import React from 'react'
const links = [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Blog", href: "/blog" }
    ]
function Navbar() {
  return (
    <div className='navbar-root'>
        <div className='logo'> Fintech</div>
        <div className='link-items'>
        {links.map((link, idx) => {
            return(
                <a  className= 'link-items' key={idx} href = {link.href}>{link.name}</a>
            )
        })}
        <button className='btn'>
            <span className='btn-text'>Start Free trial</span>
        </button>
        </div>
    </div>
  )
}

export default Navbar