'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IconArrowBarRight, IconArrowBarLeft,
    IconHome, IconChartBar, IconFileText, IconSettings, IconHelp
 } from '@tabler/icons-react';

type NavItem = {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
}

// add more components in description of dashboard
function Dashboard() {
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', description: 'Summary and stats', icon: <IconHome size={24} /> },
    { id: 'analytics', label: 'Analytics', description: 'Charts and metrics', icon: <IconChartBar size={24} /> },
    { id: 'content', label: 'Content', description: 'Pages and posts', icon: <IconFileText size={24} /> },
    { id: 'settings', label: 'Settings', description: 'Preferences and config', icon: <IconSettings size={24} /> },
    { id: 'help', label: 'Help', description: 'Documentation & support', icon: <IconHelp size={24} /> },
  ]

  const [active, setActive] = useState<string>(navItems[0].id)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const sidebarVariant = {
    open : {
        width : '240px'
    },
    closed : {
        width : '80px'  
    },
    transition: { ease: 'easeInOut', duration: 0.3 }
  }

  const childVariant = {
    open: {
      opacity: 1,
      y: 0
    },
    closed: {
      opacity: 0,
      y: -20
    },
  }

  const ulParentVariant = {
    open: {
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    },
    closed: {
      transition: { staggerChildren: 0.05, staggerDirection: -1 }
    }
  }

  return (
    <motion.div className="flex gap-6 min-h-screen min-w-screen bg-black relative" animate={isOpen ? 'open' : 'closed'}>
      {/* Sidebar */}
      <motion.nav variants={sidebarVariant}
       className="rounded-lg p-3 bg-white/10 absolute top-0 left-0 h-full box-border backdrop-blur-xl border border-white/20 shadow-2xl">
        <div className="font-semibold mb-5 flex items-center justify-between">
            {/* <motion.div>
                <span className=' text-white text-2xl'></span>
            </motion.div> */}
            <motion.button 
                className='mt-2 flex items-center gap-1 bg-white/20 backdrop-blur-sm p-2 rounded-full shadow-md hover:shadow-lg hover:bg-white/30 transition-all duration-300'
                onClick={() => setIsOpen(!isOpen)}
                >
                <span className=' text-black z-20'>{isOpen ? <IconArrowBarLeft size={18} /> : <IconArrowBarRight size={18} />}</span>
            </motion.button>
        </div>
        <motion.ul variants={ulParentVariant} className="list-none p-0 m-0">
          {navItems.map((item) => {
            const isActive = item.id === active
            return (
              <motion.li variants={childVariant} key={item.id} className="mb-1.5">
                <button
                  onClick={() => setActive(item.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`flex items-center w-full gap-2.5 rounded-md border-0 cursor-pointer relative`}
                >

                  {isActive && (
                    <motion.div 
                      layoutId='activeIndicator'
                      className="absolute inset-0 bg-white/80 rounded-md"
                    />
                  )}
                
                  <motion.div
                    className={`w-9 h-9 rounded-md flex items-center justify-center text-sm font-bold relative z-10 ${isActive ? 'text-black' : 'text-white'} transition-colors duration-300`}
                  >
                    {item.icon}
                  </motion.div>

                  <div className={`${isOpen ? '' : 'hidden'}`}>
                    <div className={`text-md text-white font-semibold pl-2`}>{item.label}</div>
                  </div>
                </button>
              </motion.li>
            )
          })}
        </motion.ul>
      </motion.nav>

      {/* Background content to demonstrate blur */}
      <div className="w-screen h-screen flex items-center justify-center text-white">
        <div className='bg-white/10 p-8 rounded-lg shadow-lg backdrop-blur-lg w-96 h-96 border border-white/20'>
          
          {!isOpen && ( <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-4xl font-bold mb-4">Select an Item first</h1>
            </motion.div>
          )}
          
          <AnimatePresence mode="wait">
          {isOpen && ( <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-4xl font-bold mb-4">{navItems.find(item => item.id === active)?.label}</h1>
              <p className="text-gray-300">{navItems.find(item => item.id === active)?.description}</p>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export default Dashboard