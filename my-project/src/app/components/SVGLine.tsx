'use client'

import React from 'react'
import { motion } from 'framer-motion'

export const SVGLine = () => {
  return (
    <div>
        <motion.div className='h-40 w-40 flex items-center justify-center bg-neutral-100 rounded-md shadow-2xl p-px relative overflow-hidden'
        whileHover="animate">
            {/* <div className='w-full h-full rounded-[5px] bg-white relative z-20'></div>
            <div className='absolute h-full w-full [background-image:conic-gradient(at_center,transparent,var(--color-blue-500)_20%,transparent_30%)]
            animate-spin scale-[1.4]'></div>
            <div className='absolute h-full w-full [background-image:conic-gradient(at_center,transparent,var(--color-red-500)_20%,transparent_30%)]
            animate-spin scale-[1.4] [animation-delay:0.4s]'></div> */}




        <SVGLinefordemo2 />

        </motion.div>
    </div>
  )
}


export default SVGLine

export const SVGLinefordemo = () => {
  const width = 317;
  const height = 80;
  return (
    <svg width={width} height={height} viewBox="0 0 317 80" fill="none">
      <path
        d="M316 0V10C316 12.2091 314.209 14 312 14H5C2.79086 14 1 15.7909 1 18V80"
        stroke="black"
        strokeOpacity="0.2"
      />
      <path
        d="M316 0V10C316 12.2091 314.209 14 312 14H5C2.79086 14 1 15.7909 1 18V80"
        stroke="url(#pulse-1)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <defs>
        <motion.linearGradient
          animate={{
            x1: [0, width * 2],
            x2: [0, width],
            y1: [height, height / 2],
            y2: [height * 2, height]
          }}
          transition={{
            duration: 5,
            repeat: Infinity
          }}
        // x1="0"
        // x2="0"
        // y1={height-40}
        // y2={height * 2-80}
          id="pulse-1"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2EB9DF" stopOpacity="0" />
          <stop stopColor="#2EB9DF" />
          <stop offset="1" stopColor="#9E00FF" stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
}

// draw a simple line this time for demo2

// export const SVGLinefordemo2 = () => {
//   const width = 317;
//   const height = 80;
//   return (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
//     className="icon icon-tabler icons-tabler-outline icon-tabler-baseline-density-large">
//     <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
//     <path d="M2 4 L22 4" />   // Line from (2,4) to (22,4)
//     <path d="M2 20 L22 20" />  // Line from (2,20) to (22,20)
//     </svg>
//   )}



export const SVGLinefordemo2 = () => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="icon icon-tabler icons-tabler-outline icon-tabler-baseline-density-large"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      
      {/* Base lines (always visible) */}
      <path 
        d="M2 4 L22 4"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="2"
      />
      <path 
        d="M2 20 L22 20"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="2"
      />
      
      {/* Pulse lines on top */}
      <path 
        d="M2 4 L22 4"
        stroke="url(#pulse-1)"
        strokeWidth="2"
      />
      <path 
        d="M2 20 L22 20"
        stroke="url(#pulse-2)"
        strokeWidth="2"
      />
      
      <defs>
        <motion.linearGradient
          id="pulse-1"
          gradientUnits="userSpaceOnUse"
          initial={{ x1: 0, x2: 5 }}
          animate={{ x1: 22, x2: 27 }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </motion.linearGradient>
        
        <motion.linearGradient
          id="pulse-2"
          gradientUnits="userSpaceOnUse"
          initial={{ x1: 0, x2: 5 }}
          animate={{ x1: 22, x2: 27 }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "linear",
            delay: 0.3
          }}
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  )
}