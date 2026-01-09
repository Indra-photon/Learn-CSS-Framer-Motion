'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

export const TrashSvg: React.FC<{ deleteState: 'idle' | 'deleting' | 'deleted' }> = ({ deleteState }) => {
    const closedLid = "M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3";
    const openLid = "M9 3v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3";

    return (
        <motion.svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="icon icon-tabler icons-tabler-outline icon-tabler-trash"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M4 7l16 0" />
            <path d="M10 11l0 6" />
            <path d="M14 11l0 6" />
            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
            <motion.path 
                animate={{ d: deleteState === 'deleting' ? openLid : closedLid }}
                transition={{ duration: 0.3 }}
            />
        </motion.svg>
    )
}

const DeleteButton: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [deleteState, setDeleteState] = useState<'idle' | 'deleting' | 'deleted'>('idle');

    const handleDelete = () => {
        setDeleteState('deleting');
        setIsHovered(false);
        
        setTimeout(() => {
            setDeleteState('deleted');
            
            setTimeout(() => {
            setDeleteState('idle');
            }, 1000); // Shows "Deleted" for 1 second
        }, 2000); // Shows "Deleting..." for 1 second
    }
  return (
    <div className='min-h-screen min-w-screen flex items-center justify-center bg-black'>
        <div className='w-72 h-96 bg-white/30 backdrop-blur-3xl shadow-2xl border border-neutral-300 rounded-lg flex flex-col items-center justify-center gap-6 cursor-pointer'>
            <motion.button
                onClick={handleDelete}
                initial={{ width: '140px', scale: 1 }}
                whileHover={deleteState === 'idle' ? { width: '260px', scale: 1, transition: { duration: 0.2 } } : {}}
                animate={{ 
                width: deleteState === 'deleting' ? '260px' : deleteState === 'deleted' ? '260px' : '140px'
                }}
                onHoverStart={() => deleteState === 'idle' ? setIsHovered(true) : null}
                onHoverEnd={() => deleteState === 'idle' ? setIsHovered(false) : null}
                className={`flex items-center justify-center gap-4 bg-black rounded-3xl cursor-pointer ${deleteState !== 'idle' ? 'pointer-events-none' : ''}`}
            >
                <AnimatePresence mode="wait">
                    <motion.span 
                        key={deleteState !== 'idle' ? deleteState : (isHovered ? 'hovered' : 'not-hovered')}
                        className='text-white tracking-tighter flex items-center justify-center gap-2 px-3 py-2'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        
                    >
                        {deleteState === 'deleting' ? 'Deleting...' : 
                        deleteState === 'deleted' ? 'Deleted' : 
                        (isHovered ? 'Are you sure?' : 'Delete')}
                        <motion.span
                            key={deleteState}
                            initial={{ rotate: 0 }}
                            animate={{ rotate: deleteState === 'deleting' ? 360 : 0 }}
                            transition={{ duration: deleteState === 'deleting' ? 1 : 0 }} 
                        >
                            <TrashSvg deleteState={deleteState} />
                        </motion.span>
                    </motion.span>
                </AnimatePresence>
            </motion.button>
        </div>

    </div>
  )
}

export default DeleteButton