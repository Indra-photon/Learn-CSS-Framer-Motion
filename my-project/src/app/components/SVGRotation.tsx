// 'use client'

// import { motion } from 'motion/react'
// import React, { useState } from 'react'

// function SVGRotation() {
//     const [isHovered, setIsHovered] = useState(false);
//     const [startDelete, setStartDelete] = useState(false);
//     const [isDeleted, setIsDeleted] = useState(false);

//     const handleDelete = () => {
//         setStartDelete(true);
//         setTimeout(() => {
//             setIsDeleted(true);
//             setStartDelete(false);
//         }, 5000); // Duration matches the CSS transition duration
//     };

//   return (
//     <div className='min-h-screen min-w-screen flex items-center justify-center bg-black'>
//         <div className='w-72 h-96 bg-white/30 backdrop-blur-3xl shadow-2xl border border-neutral-300 rounded-lg flex flex-col items-center justify-center gap-6 cursor-pointer'>
//             <motion.button
//                 onClick={handleDelete}
//                 className='bg-red-500 py-1 px-6 rounded-full border-2 border-red-400'>
//                 <motion.span className='flex items-center justify-center gap-2 text-white'>
//                     <motion.span className='flex'>
//                         {startDelete && !isDeleted ? 
//                             (
//                                 <>
//                                     {"Delet"}
//                                     {["i", "n", "g"].map((letter, index) => (
//                                         <motion.span
//                                             key={`ing-${index}`}
//                                             className='inline-block' // CRITICAL: makes vertical animation work
//                                             initial={{ opacity: 0, y: 10 }}
//                                             animate={{ opacity: 1, y: 0 }}
//                                             transition={{ 
//                                                 type: "spring", 
//                                                 damping: 20, 
//                                                 stiffness: 350, 
//                                                 delay: index * 0.1 
//                                             }}
//                                         >
//                                             {letter}
//                                         </motion.span>
//                                     ))}
//                                 </>
//                             ) : !isDeleted ? (
//                                 "Delete"
//                             ) : (
//                                 <>
//                                     {"Delet"}
//                                     {["e", "d"].map((letter, index) => (
//                                         <motion.span
//                                             key={`ed-${index}`}
//                                             className='inline-block' // CRITICAL: makes vertical animation work
//                                             initial={{ opacity: 0, y: 10 }}
//                                             animate={{ opacity: 1, y: 0 }}
//                                             transition={{ 
//                                                 type: "spring", 
//                                                 damping: 20, 
//                                                 stiffness: 350, 
//                                                 delay: index * 0.1 
//                                             }}
//                                         >
//                                             {letter}
//                                         </motion.span>
//                                     ))} 
                                
//                                 </>
//                             )
//                         }
//                     </motion.span>
//                     <TrashIcon rotation={startDelete ? 20 : 0} />
//                 </motion.span>
//             </motion.button>
//         </div>
//     </div>
//   )
// }

// export default SVGRotation


// const TrashIcon: React.FC<{ rotation: number }> = ({ rotation }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="-2 -6 28 32" fill="none" 
//     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
//     className="icon icon-tabler icons-tabler-outline icon-tabler-trash">
//         <g
//         style = {{
//             overflow: 'visible',
//             transformOrigin: 'right bottom',
//             transformBox: 'fill-box',
//             transform: `rotate(${rotation}deg)`,
//             transition: 'transform 0.3s ease-out'
//         }}
//         >
//             <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
//             <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
//             <path d="M4 7l16 0" />
//         </g>
//         <path d="M10 11l0 6" />
//         <path d="M14 11l0 6" />
//         <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
//     </svg>
// )

'use client'

import { backOut, easeInOut, easeOut, motion } from 'motion/react'
import { spring } from "motion"
import React, { useState } from 'react'
import { IconChecks } from '@tabler/icons-react';


function MicrointeractionComparison() {
    // State for animated version
    const [startDelete, setStartDelete] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // State for static version
    const [staticDeleted, setStaticDeleted] = useState(false);

    const handleAnimatedDelete = () => {
        setStartDelete(true);
        setTimeout(() => {
            setIsDeleted(true);
            setStartDelete(false);
        }, 5000);
    };
    const handleAnimatedDeletebutton1 = () => {
    setStartDelete(true);
    setTimeout(() => {
        setIsDeleted(true);
        setStartDelete(false);
    }, 5000);
    
    // Add this new timeout
    setTimeout(() => {
        // setIsDeleted(false);
        setIsHovered(false);
    }, 7000); // Waits 2 more seconds after showing "Deleted successfully"
};

    const handleStaticDelete = () => {
        setStaticDeleted(true);
    };

    const resetBoth = () => {
        setStartDelete(false);
        setIsDeleted(false);
        setStaticDeleted(false);
    };

    const slideVariants = {
    rest: {
        x: '0%',
        justifyContent: 'center',
        gap: '0rem',
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem',
        transition: {
            type: "spring" as const,
            stiffness: 300,      // Higher = faster spring
            damping: 20,         // Lower = more bounce (try 15-25)
            mass: 2,             // Higher = slower, heavier feel
        }
    },
    hover: {
        x: '-80%',
        justifyContent: 'space-between',
        gap: '0rem',
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem',
        paddingBottom: '0.1rem',
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 20,
            mass: 1,
        }
    },
};


    return (
        <div className='min-h-screen w-full flex flex-col items-center justify-center bg-black gap-8 p-8'>
            {/* Reset Button */}
            <button 
                onClick={resetBoth}
                className='text-sm absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white px-1 py-1 rounded-lg border border-white/30 transition-colors'
            >
                Reset
            </button>

            {/* Main Title */}
            <div className='text-center mb-4'>
                <h1 className='text-4xl font-bold text-white mb-2'>Microinteractions Matter</h1>
                <p className='text-white/60 text-lg'>The difference between good and great UX</p>
            </div>

            {/* Comparison Container */}
            <div className='flex gap-12 items-center'>
                {/* STATIC VERSION - BORING */}
                <div className='flex flex-col items-center gap-6'>
                    <div className='text-center mb-2'>
                        <h2 className='text-2xl font-semibold text-red-400 mb-1'>Without Microinteractions</h2>
                        <p className='text-white/50 text-sm'>❌ Static & Boring</p>
                    </div>
                    <div className='w-72 h-96 bg-red-500 backdrop-blur-3xl shadow-2xl border border-neutral-300 rounded-lg flex flex-col items-center justify-center gap-6'>
                        <motion.button
                            // whileHover="hover"
                            // initial="rest"
                            onHoverStart={() => setIsHovered(true)}
                            onHoverEnd={() => { if (!startDelete && !isDeleted) setIsHovered(false) }}
                            animate={isHovered || startDelete ? "hover" : "rest"}
                            onClick={handleAnimatedDeletebutton1}
                            className="relative overflow-hidden bg-red-700 w-[200px] py-1 px-8 rounded-full border-2 border-red-400"
                            >
                            <motion.span
                            // onClick={handleAnimatedDelete}
                            className="pl-4 flex items-center justify-center gap-2 text-white">
                                <motion.span className='flex'>
                                    {startDelete && !isDeleted ? 
                                        (
                                            <>
                                                {"Delet"}
                                                {["i", "n", "g"].map((letter, index) => (
                                                    <motion.span
                                                        key={`ing-${index}`}
                                                        className='inline-block'
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ 
                                                            type: "spring", 
                                                            damping: 20, 
                                                            stiffness: 350, 
                                                            delay: index * 0.1 
                                                        }}
                                                    >
                                                        {letter}
                                                    </motion.span>
                                                ))}
                                            </>
                                        ) : !isDeleted ? (
                                            "Are you sure?"
                                        ) : (
                                            <>
                                                {"Delet"}
                                                {["e", "d"].map((letter, index) => (
                                                    <motion.span
                                                        key={`ed-${index}`}
                                                        className='inline-block'
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ 
                                                            type: "spring", 
                                                            damping: 20, 
                                                            stiffness: 350, 
                                                            delay: index * 0.1 
                                                        }}
                                                    >
                                                        {letter}
                                                    </motion.span>
                                                ))} 
                                            </>
                                        )
                                    }
                                </motion.span>
                            </motion.span>

                            <motion.span
                                variants={slideVariants}
                                className="absolute inset-0 flex items-center bg-white rounded-full text-red-700 pointer-events-none"
                            >
                                {
                                    isDeleted ? (
                                        <motion.span> Deleted successfully </motion.span>
                                    ) : (
                                        <motion.span> Delete </motion.span>
                                    )
                                }

                                <motion.div>
                                    {isDeleted ? (
                                        <IconChecks size={20} />
                                    ) : (
                                        <AnimatedTrashIcon rotation={startDelete ? 20 : 0} />
                                    )}
                                </motion.div>
                            </motion.span>
                        </motion.button>
                    </div>
                </div>

                {/* VS Separator */}
                <div className='flex flex-col items-center gap-4'>
                    <div className='w-px h-96 bg-gradient-to-b from-transparent via-white/30 to-transparent'></div>
                    <div className='text-white/80 font-bold text-2xl bg-white/10 px-4 py-2 rounded-full border border-white/30'>
                        VS
                    </div>
                    <div className='w-px h-96 bg-gradient-to-b from-transparent via-white/30 to-transparent'></div>
                </div>

                {/* ANIMATED VERSION - WITH MICROINTERACTIONS */}
                <div className='flex flex-col items-center gap-6'>
                    <div className='text-center mb-2'>
                        <h2 className='text-2xl font-semibold text-green-400 mb-1'>With Microinteractions</h2>
                        <p className='text-white/50 text-sm'>✨ Delightful & Engaging</p>
                    </div>
                    <div className='w-72 h-96 bg-white/30 backdrop-blur-3xl shadow-2xl border border-neutral-300 rounded-lg flex flex-col items-center justify-center gap-6'>
                        <motion.button
                            onClick={handleAnimatedDelete}
                            disabled={isDeleted}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className='bg-red-500 py-1 px-6 rounded-full border-2 border-red-400 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            <motion.span className='flex items-center justify-center gap-2 text-white'>
                                <motion.span className='flex'>
                                    {startDelete && !isDeleted ? 
                                        (
                                            <>
                                                {"Delet"}
                                                {["i", "n", "g"].map((letter, index) => (
                                                    <motion.span
                                                        key={`ing-${index}`}
                                                        className='inline-block'
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ 
                                                            type: "spring", 
                                                            damping: 20, 
                                                            stiffness: 350, 
                                                            delay: index * 0.1 
                                                        }}
                                                    >
                                                        {letter}
                                                    </motion.span>
                                                ))}
                                            </>
                                        ) : !isDeleted ? (
                                            "Delete"
                                        ) : (
                                            <>
                                                {"Delet"}
                                                {["e", "d"].map((letter, index) => (
                                                    <motion.span
                                                        key={`ed-${index}`}
                                                        className='inline-block'
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ 
                                                            type: "spring", 
                                                            damping: 20, 
                                                            stiffness: 350, 
                                                            delay: index * 0.1 
                                                        }}
                                                    >
                                                        {letter}
                                                    </motion.span>
                                                ))} 
                                            </>
                                        )
                                    }
                                </motion.span>
                                <AnimatedTrashIcon rotation={startDelete ? 20 : 0} />
                            </motion.span>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Feature Highlights */}
            <div className='flex gap-8 mt-8'>
                <div className='text-center'>
                    <div className='text-white/40 text-sm mb-2'>Static Features</div>
                    <div className='flex flex-col gap-2 text-white/60 text-xs'>
                        <div>• No feedback</div>
                        <div>• Instant state change</div>
                        <div>• No visual interest</div>
                    </div>
                </div>
                <div className='text-center'>
                    <div className='text-white/70 text-sm mb-2 font-semibold'>Microinteraction Features</div>
                    <div className='flex flex-col gap-2 text-white/80 text-xs'>
                        <div>✓ Hover & tap feedback</div>
                        <div>✓ Animated state transitions</div>
                        <div>✓ Trash lid animation</div>
                        <div>✓ Letter-by-letter reveal</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MicrointeractionComparison

// Static Trash Icon (no animation)
const StaticTrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="-2 -6 28 32" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    className="icon icon-tabler icons-tabler-outline icon-tabler-trash">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
        <path d="M4 7l16 0" />
        <path d="M10 11l0 6" />
        <path d="M14 11l0 6" />
        <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
    </svg>
)

// Animated Trash Icon (with lid rotation)
const AnimatedTrashIcon: React.FC<{ rotation: number }> = ({ rotation }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="-2 -6 28 32" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    className="icon icon-tabler icons-tabler-outline icon-tabler-trash">
        <g
        style = {{
            overflow: 'visible',
            transformOrigin: 'right bottom',
            transformBox: 'fill-box',
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 0.3s ease-out'
        }}
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
            <path d="M4 7l16 0" />
        </g>
        <path d="M10 11l0 6" />
        <path d="M14 11l0 6" />
        <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
    </svg>
)