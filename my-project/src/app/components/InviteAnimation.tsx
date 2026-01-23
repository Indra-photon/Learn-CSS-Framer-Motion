'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { IconX } from '@tabler/icons-react'

const InvitedList = [
    {id: 1, name: 'Alice Johnson', invitedFor: 'Birthday Party'},
    {id: 2, name: 'Bob Smith', invitedFor: 'Conference'},
    {id: 3, name: 'Charlie Brown', invitedFor: 'Conference'},
    {id: 4, name: 'Diana Prince', invitedFor: 'Conference'},
    {id: 5, name: 'Alice Johnson', invitedFor: 'Birthday Party'},
    {id: 6, name: 'Bob Smith', invitedFor: 'Conference'},
]

function InviteAnimation() {
    const [isClicked, setIsClicked] = useState(false)
    const [responses, setResponses] = useState<{[key: number]: 'accepted' | 'rejected' | null}>({})

    const handleResponse = (id: number, response: 'accepted' | 'rejected') => {
        setResponses(prev => ({...prev, [id]: response}))
    }
  return (
    <motion.div className='w-96 h-96 bg-stone-200 rounded-xl flex items-center justify-center my-20'>

        <AnimatePresence mode='wait'>
            {
                !isClicked && (
                    <motion.div 
                    initial={{filter: 'blur(2px)', opacity: 0}}
                    animate={{filter: 'blur(0)', opacity: 1}}
                    exit={{filter: 'blur(0)', opacity: 0}}
                    transition={{type: 'spring', stiffness: 300, damping: 25}}
                    layoutId={`top-container`} onClick={() => setIsClicked(true)}
                    className='flex flex-row items-center justify-center gap-3 rounded-3xl px-3 py-2 bg-neutral-100 cursor-pointer'>
                        <motion.p layoutId={`invite-header`} className='text-neutral-800 font-bold'>Invites</motion.p>
                        <motion.div layoutId={`invite-count`} className='bg-neutral-800 flex items-center justify-center shrink-0 h-6 w-6 rounded-full text-white'>
                            3
                        </motion.div>
                    </motion.div>
                )
            }
            

            {
                isClicked && (
                    <motion.div
                    initial={{filter: 'blur(2px)', opacity: 0}}
                    animate={{filter: 'blur(0)', opacity: 1}}
                    exit={{filter: 'blur(2px)', opacity: 0}}
                    transition={{type: 'spring', stiffness: 300, damping: 25}}
                    layoutId={`top-container`}
                    onClick={() => setIsClicked(false)}
                    className='w-60 h-80 rounded-xl px-3 py-2 bg-neutral-100 cursor-pointer'>

                        <motion.div
                        initial={{filter: 'blur(2px)', opacity: 0}}
                        animate={{filter: 'blur(0)', opacity: 1}}
                        exit={{filter: 'blur(2px)', opacity: 0}}
                        transition={{ease: 'easeInOut', duration: 0.3}}
                        className='flex flex-row items-start justify-between gap-6'>
                            <motion.p className='text-neutral-800 font-bold shrink-0' layoutId={`invite-header`}>Invites</motion.p>
                            <motion.div
                            initial={{filter: 'blur(2px)', opacity: 0}}
                            animate={{filter: 'blur(0)', opacity: 1}}
                            exit={{filter: 'blur(2px)', opacity: 0}}
                            transition={{ease: 'easeInOut', duration: 0.3}}
                            className='bg-neutral-800 flex items-center justify-center shrink-0 h-6 w-6 rounded-full text-white'>
                            <IconX size={14} />
                        </motion.div>
                    </motion.div>

                     <motion.div
                        initial={{filter: 'blur(2px)', opacity: 0}}
                        animate={{filter: 'blur(0)', opacity: 1}}
                        exit={{filter: 'blur(2px)', opacity: 0}}
                        transition={{ease: 'easeInOut', duration: 0.3, delay: 0.5}}>
                            Total 6 people are invited to this event.
                    </motion.div>

                    <AnimatePresence mode="popLayout">
                    <motion.div
                        className='mt-4 max-h-52 overflow-y-auto space-y-2'>
                            {
                                InvitedList.filter(invite => !responses[invite.id]).map((invite) => (
                                    <motion.div key={invite.id}
                                    layout
                                    initial={{filter: 'blur(2px)', y: -10, opacity: 0}}
                                    animate={{filter: 'blur(0)', y: 0, opacity: 1}}
                                    exit={{
                                        filter: 'blur(2px)', 
                                        x: responses[invite.id] === 'accepted' ? -300 : 300,  // Left for accepted, right for rejected
                                        opacity: 0
                                    }}
                                    transition={{ease: 'easeInOut', duration: 0.3}}
                                    className='p-2 bg-white rounded-lg shadow-sm'>
                                        <p className='font-medium text-sm text-neutral-900'>{invite.name}</p>
                                        <p className='text-sm text-neutral-600'>Purpose: {invite.invitedFor}</p>
                                        <div className='flex gap-2 mt-2'>
                                        <button onClick={(e) => {e.stopPropagation(); handleResponse(invite.id, 'accepted')}} 
                                                className='px-3 py-1 bg-green-500 text-white text-xs rounded'>Accept</button>
                                        <button onClick={(e) => {e.stopPropagation(); handleResponse(invite.id, 'rejected')}} 
                                                className='px-3 py-1 bg-red-500 text-white text-xs rounded'>Reject</button>
                                        </div>
                                    </motion.div>
                                ))
                            }
                    </motion.div>
                    </AnimatePresence>


                    </motion.div>
                )
            }


        </AnimatePresence>
        


    </motion.div>
  )
}

export default InviteAnimation