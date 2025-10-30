'use client'

import React from 'react'
import Image from 'next/image'
import { IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';

const AnimatedCard = () => {
    const [open, setOpen] = React.useState(true);

  return (
    <>

        <AnimatePresence>
            {open &&  <motion.div 
                initial={{opacity:1, scale:0.98, filter: 'blur(10px)'}}
                animate={{opacity:1, scale:1, filter: 'blur(0px)'}}
                exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            
            className='w-72 h-[26rem] rounded-xl 
                p-4 flex flex-col
                shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(34,42,53,0.04),0_24px_68px_rgba(47,48,55,0.05),0_2px_3px_rgba(0,0,0,0.04)]'>

                    <h1 className='font-bold text-[20px]'> Aceternity UI Components </h1>
                    <p className='text-neutral-600 mt-2 text-[10px]'> A collection of beautiful UI components</p>
                    <div className="flex items-center justify-center">
                        <button 
                        onClick={() => setOpen(false)}
                        className='flex items-center gap-1 mt-4 text-[10px] shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(34,42,53,0.04),0_24px_68px_rgba(47,48,55,0.05),0_2px_3px_rgba(0,0,0,0.04)]
                    rounded-md px-2 py-1'> <Image src='/images/1.png' alt='Image description' width={50} height={50} className='h-4 w-4'/> Aceternity
                    <IconX size={10} />
                    </button>
                    </div>

                    <div className="bg-gray-100 flex-1 mt-4 rounded-lg border border-dashed border-neutral-200 shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(34,42,53,0.04),0_24px_68px_rgba(47,48,55,0.05),0_2px_3px_rgba(0,0,0,0.04)] relative">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                            whileHover={{ opacity: 1, scale: 1.05, filter: 'blur(0px)' }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        
                        
                        className="absolute inset-0 h-full w-full bg-white rounded-lg divide-y divide-neutral-200 text-[10px] overflow-hidden shadow-lg border border-neutral-100">
                            <div className="p-4 flex item-start">abcd</div>
                            <div className="p-4 flex item-start">efgh</div>
                            <div className="p-4 flex item-start">ijkl</div>
                            <div className="p-4 flex item-start">mnop</div>
                        </motion.div>

                    </div>
                </motion.div>
            }
        </AnimatePresence>
    </>
  )
}

export default AnimatedCard
