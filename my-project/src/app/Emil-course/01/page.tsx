'use client'


import React from 'react'
import {motion, AnimatePresence} from 'motion/react'

function page() {

    const [isClicked, setisClicked] = React.useState(false);
  return (
    <div className='w-full h-screen bg-stone-100 flex flex-col items-center justify-center gap-6'>

    <div className='flex flex-col items-center justify-center gap-4 w-96 h-80 bg-stone-50 border border-stone-300 rounded-lg shadow-md relative overflow-hidden'>
        <motion.button layout
        
        className='px-3 py-1 flex items-center gap-2 bg-stone-900 text-stone-100 rounded-md cursor-pointer' onClick={() => setisClicked(!isClicked)}>
            {isClicked ? "Subscribe" : "Subscribe"}
        </motion.button>

        <AnimatePresence>
            {
                isClicked && (
                    <motion.div 
                        initial={{ scale: 0, opacity: 0, }}
                        animate={{ scale: 1, opacity: 1, transition: { ease: [1,0,0,1], duration: 0.3 } }}
                        exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
                        className="px-4 py-2 bg-stone-100 text-stone-900 rounded-xl shadow-lg origin-bottom absolute top-18 left-1/2 -translate-x-1/2"
                    >
                        Thank you for subscribing!
                    </motion.div>
                )
            }
        </AnimatePresence>
    </div>

    <p className='text-stone-400 font-regular'> cubic-bezier(1,0,0,1);</p>
    </div>
  )
}

export default page