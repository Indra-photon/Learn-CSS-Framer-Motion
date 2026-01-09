'use client'

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IconMapPins, IconClockHour10, IconEyeCode } from '@tabler/icons-react';
import { IconCalendar, IconFlame, IconPhone } from '@tabler/icons-react'

const imglist = [
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
  'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
]

// Parent variants
const containerVariants = {
  rest: {},
  hover: {}
}

// Children variants - uses custom prop for different offsets
const cardVariants = {
  rest: (idx: number) => ({
    left: `${idx * 25}px`,
    // rotate: -5 + idx * 5, // -10deg, 0deg, 10deg
    transition: { duration: 0.3 }
  }),
  hover: (idx: number) => ({
    left: `${idx !== 0 ? (idx === 1 ? 90 : 150) : 5}px`,
    rotateZ:  `${ idx !== 2 ? - idx * 15 : -40}deg`, // -30deg, 0deg, 30deg
    transition: { duration: 0.3 }
  })
}

function AnimatedProfileCards() {
  const [hovered, setHovered] = React.useState(false);
  const [callHovered, setCallHovered] = React.useState(false);
  return (
    <div className='min-h-screen w-screen flex items-center justify-center bg-black'>
      <motion.div 
        className='w-[400px] h-full bg-neutral-300 rounded-xl shadow-lg p-4 relative overflow-hidden'
        variants={containerVariants}
        initial="rest"
        whileHover="hover"
      >
        <h1 className='text-7xl font-bold'>Mountain hike</h1>
        
        <motion.div className='relative w-44 h-56 mt-12'>
          {imglist.map((imgSrc, idx) => (
            <motion.div
              key={idx}
              className='absolute w-full h-full'
              variants={cardVariants}
              custom={idx}
              style={{
                zIndex: idx,
                transformOrigin: 'top left'
              }}
            >
              <img
                src={imgSrc}
                alt={`Mountain ${idx}`}
                className='w-full h-full object-cover rounded-2xl shadow-md border-2 border-white cursor-pointer'
              />
            </motion.div>
          ))}
        </motion.div>

        <div className='mt-10 text-sm font-semibold text-neutral-900 flex items-center gap-4'>
          <span className='bg-neutral-200 px-2 py-2 rounded-lg shadow-3xl border border-neutral-600 flex items-center gap-1'>
            <IconClockHour10 className='h-4 w-4' /> 4 Hrs.
          </span>
          <span className='bg-neutral-200 px-2 py-2 rounded-lg shadow-3xl border border-neutral-600 flex items-center gap-1'>
            <IconMapPins className='h-4 w-4' /> 8 km
          </span>
          <span className='bg-neutral-200 px-2 py-2 rounded-lg shadow-3xl border border-neutral-600 flex items-center gap-1'>
            <IconEyeCode className='h-4 w-4' /> Medium Level
          </span>
        </div>
        
        <p className='mt-4 text-sm text-neutral-900'>
          Hiking on a mountain blends physical challenge with natural beauty, offering sweeping views.
        </p>

        <div className='mt-6 flex flex-row items-center justify-between'>
          {/* Price Section */}
          <div className='flex items-end gap-3'>
            <p className='text-4xl font-bold text-neutral-900'>$250</p>
            <span className='text-lg text-neutral-400 line-through mb-1'>$300</span>
          </div>
          
          {/* Savings Badge */}
          <div className='mt-2 inline-flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 text-sm font-medium px-3 py-1.5 rounded-full'>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save $50 (17% off)
          </div>
        </div>

        <div className='mt-3 flex items-center gap-4'>
        <motion.button 
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          className='flex items-center justify-center mt-6 w-1/2 bg-neutral-800 text-white px-5 py-3 rounded-full shadow-lg font-semibold'
        >
          <AnimatePresence mode='wait' >
            {hovered && (
              <motion.span
                key={"spots-left"}
                initial={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className='flex items-center gap-2'
              >
                <IconFlame className='w-4 h-4 text-orange-400' />
                2 spots left</motion.span>
            )}
            {!hovered && (
              <motion.span
                key={"reserve-spot"}
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className='flex items-center gap-2'
              >
                <IconCalendar className='w-4 h-4' />
                Reserve Spot
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        <motion.button 
          onHoverStart={() => setCallHovered(true)}
          onHoverEnd={() => setCallHovered(false)}
          className='mt-6 w-1/2 bg-neutral-800 text-white px-6 py-3 rounded-full shadow-lg font-semibold hover:bg-neutral-900 transition-colors'
        >
          <AnimatePresence mode="wait">
            {callHovered ? (
              <motion.span
                key="free-consult"
                initial={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className='flex items-center justify-center gap-2'
              >
                <IconCalendar className='w-4 h-4' />
                Free Call
              </motion.span>
            ) : (
              <motion.span
                key="book-call"
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className='flex items-center justify-center gap-2'
              >
                <IconPhone className='w-4 h-4' />
                Book a Call
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        </div>

      </motion.div>
    </div>
  )
}

export default AnimatedProfileCards