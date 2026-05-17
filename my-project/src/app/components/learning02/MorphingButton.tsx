"use client"
    

import { IconBell } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'motion/react'
import React from 'react'

function MorphingButton() {
    const [isClicked, setIsClicked] = React.useState(false)
    const [email, setEmail] = React.useState('')

    const handleNotify = () => {
        if (!email.trim()) {
            setIsClicked(false)
        }
    }

  return (
    <div className='flex items-center justify-center h-screen'>

        <motion.div
            layoutId='buy-notify-button-wrapper'
            role='button'
            onClick={() => setIsClicked(!isClicked)}
            style={{ borderRadius: 20 }}
            className='flex items-center gap-2 h-9 px-3 bg-[#1c1c1e] border border-[#2c2c2e] text-white text-sm font-medium cursor-pointer select-none shadow-md'
        >
            <motion.span layoutId='buy-notify-button-icon'>
                <IconBell size={16} />
            </motion.span>
            <motion.span layoutId='buy-notify-button-text'>Notify Me</motion.span>
        </motion.div>

        <AnimatePresence>
            
            {isClicked ? (
                <motion.div style={{ borderRadius: 20 }} className='flex items-center justify-between gap-4 h-9 px-1 bg-stone-300  text-white text-sm font-medium cursor-pointer select-none shadow-md' layoutId='buy-notify-button-wrapper'>
                    <motion.div className='flex-1'>
                        <motion.input
                        initial={{ opacity: 0, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(4px)' }}
                    transition={{ duration: 0.02, ease: [.075, .82, .165, 1] }}
                            layoutId='buy-notify-input'
                            placeholder='Write your email'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className='w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 pl-2 placeholder:pl-2'
                        />
                    </motion.div>

                    <motion.div
                    initial={{ opacity: 0, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(4px)' }}
                    transition={{ duration: 0.02, ease: [.075, .82, .165, 1] }}
                    onClick={handleNotify}
                    style={{ borderRadius: 20 }} className='flex h-7 items-center gap-2 bg-[#1c1c1e] px-2 border border-[#2c2c2e] text-white text-sm font-medium cursor-pointer'>
                        <motion.span
                        initial={{ opacity: 0, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, filter: 'blur(4px)' }}
                        transition={{ delay: 0.10, duration: 0.12, ease: [.215, .61, .355, 1] }}
                        layoutId='buy-notify-button-icon'>
                            <IconBell size={16} />
                        </motion.span>
                        <motion.span
                        initial={{ opacity: 0, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, filter: 'blur(4px)' }}
                        transition={{ delay: 0.10, duration: 0.12, ease: [.215, .61, .355, 1] }}
                        className='' layoutId='buy-notify-button-text'>Notify Me</motion.span>
                    </motion.div>

                </motion.div>

            ) : null}


        </AnimatePresence>

    </div>
  )
}

export default MorphingButton