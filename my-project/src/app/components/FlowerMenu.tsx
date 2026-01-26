'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { IconX, IconCategoryFilled } from '@tabler/icons-react'
import StackIcon from "tech-stack-icons";

const techStake = [
    {id: 1, name: "React", icon: <StackIcon name="react" className='w-6 h-6 text-stone-500' />},
    {id: 2, name: "Next.js", icon: <StackIcon name="nextjs" className='w-6 h-6 text-stone-500' />},
    {id: 3, name: "MongoDB", icon: <StackIcon name="mongodb" className='w-6 h-6 text-stone-500' />},
    {id: 4, name: "PostgreSQL", icon: <StackIcon name="postgresql" className='w-6 h-6 text-black' />},
    {id: 5, name: "Supabase", icon: <StackIcon name="supabase" className='w-6 h-6 text-stone-500' />},
    {id: 6, name: "Postman", icon: <StackIcon name="postman" className='w-6 h-6 text-stone-500' />},
    {id: 7, name: "Figma", icon: <StackIcon name="figma" className='w-6 h-6 text-stone-500' />}
]


function FlowerMenu() {
    const [ismainButtonClicked, setismainButtonClicked] = useState(false)
    const radius = 110;
    const springConfig = { type: "spring" as const, stiffness: 300, damping: 15 };
  return (
    <div className='w-80 h-90 bg-stone-100 rounded-2xl border-2 border-stone-800 flex flex-col items-center justify-center relative overflow-hidden'>

        <motion.h1 className='text-stone-500 absolute top-4 tracking-tighter'>Explore the technology I use</motion.h1>



        <motion.div layout onClick={() => setismainButtonClicked(!ismainButtonClicked)}>
            <motion.p className='p-1 font-bold tracking-tight rounded-full bg-stone-300 cursor-pointer relative overflow-hidden z-20'> 
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={ismainButtonClicked ? "close-icon" : "search-icon"}
                        initial={{ opacity: 0, rotate: ismainButtonClicked ? -90 : 90, filter: "blur(4px)" }}
                        animate={{ opacity: 1, rotate: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, rotate: ismainButtonClicked ? 90 : -90, filter: "blur(4px)" }}
                        transition={{ duration: 0.2 }}
                    >
                        {ismainButtonClicked ? <IconX className='w-6 h-6 text-neutral-800' /> : <motion.span> <IconCategoryFilled className='w-6 h-6 text-neutral-800' /></motion.span>}
                    </motion.div>
                </AnimatePresence>
            </motion.p>
        </motion.div>

        <AnimatePresence>
            {
                ismainButtonClicked && (
                    <motion.div className="absolute flex items-center justify-center"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>

                        {techStake.map((tech, index) => {
                        // Calculate angle for each icon
                        const angle = (index / techStake.length) * (2 * Math.PI);
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;

                        return (
                            <motion.div
                            key={tech.id}
                            initial={{ x: 0, y: 0, opacity: 0 }}
                            animate={{ x, y, opacity: 1, transition: springConfig }}
                            exit={{ x: 0, y: 0, opacity: 0, transition: {ease: "easeIn", duration: 0.3} }}
                            className="absolute"
                            >
                            {/* Counter-rotation to keep icons upright */}
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="w-6 h-6 flex items-center justify-center"
                            >
                                {tech.icon}
                            </motion.div>
                            </motion.div>
                        );
                        })}

                    </motion.div>
                )
            }
        </AnimatePresence>


    </div>
  )
}

export default FlowerMenu