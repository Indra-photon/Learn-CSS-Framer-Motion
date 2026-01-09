// 'use client'

// import React, {useState} from 'react'
// import {motion, AnimatePresence} from 'motion/react'
// import { IconSearch, IconX } from '@tabler/icons-react';

// function TabAnimation() {
//     const [isExpanded, setIsExpanded] = useState(false);

//     const containerVariants = {
//         closed: { width: 48 },  // w-12 = 48px
//         open: { width: 290 }
//     }

//     const inputVariants = {
//         closed: { width: 0, opacity: 0, display: 'none' },
//         open: { width: 200, opacity: 1 }
//     }
//     const iconVariants = {
//         closed: { width: 44 , height: 44, },
//         open: { width: 36, height: 36, left: 5 }
//     }

//   return (
//     <div className='w-96 h-60 bg-neutral-100 rounded-lg shadow-lg p-4 flex items-center justify-center'>
//         <motion.div
//         variants={containerVariants}
//         animate={isExpanded ? "open" : "closed"}
//         onClick={() => setIsExpanded(!isExpanded)}
//         transition={{
//           type: "spring",
//             damping: 25,
//             stiffness: 230,
//             mass: 1.2,
//         }}
//         className={`bg-neutral-300 rounded-full p-[1px] h-12 flex items-center ${isExpanded ? 'justify-end' : 'justify-center'} cursor-pointer flex-row gap-5 relative overflow-hidden`}>
//             <motion.div
//             variants={iconVariants}
//             animate={isExpanded ? "open" : "closed"}
//             transition={{
//               type: "spring",
//               damping: 20,
//               stiffness: 230,
//               mass: 1.2,
//             }}
//             className='bg-white rounded-full absolute flex items-center justify-center shrink-0'>
//                 {/* {isExpanded ? <IconX className='w-6 h-6 text-neutral-800' /> : <IconSearch className='w-6 h-6 text-neutral-800' />} */}
//                 <AnimatePresence mode='wait'>
//                   {isExpanded ? (
//                     <motion.div
//                       key="close-icon"
//                       initial={{ opacity: 0, rotate: -90, filter: "blur(4px)" }}
//                       animate={{ opacity: 1, rotate: 0, filter: "blur(0px)" }}
//                       exit={{ opacity: 0, rotate: 90, filter: "blur(4px)" }}
//                       transition={{ duration: 0.2 }}
//                     >
//                       <IconX className='w-6 h-6 text-neutral-800' />
//                     </motion.div>
//                   ) : (
//                     <motion.div
//                       key="search-icon"
//                       initial={{ opacity: 0, rotate: 90, filter: "blur(4px)" }}
//                       animate={{ opacity: 1, rotate: 0, filter: "blur(0px)" }}
//                       exit={{ opacity: 0, rotate: -90, filter: "blur(4px)" }}
//                       transition={{ duration: 0.2 }}
//                     >
//                       <IconSearch className='w-6 h-6 text-neutral-800' />
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//             </motion.div>

//             <motion.input
//             type="text"
//             placeholder='Search...'
//             className='bg-white outline-none h-[36px] m-2 border-neutral-200 rounded-full text-neutral-700 placeholder:text-neutral-400 pl-5'
//             variants={inputVariants}
//             onClick={(e) => e.stopPropagation()}
//             transition={{
//               type: "spring",
//               damping: 20,
//               stiffness: 230,
//               mass: 1.2,
//             }}
//             />

//         </motion.div>

//     </div>
//   )
// }

// export default TabAnimation



'use client'

import React, {useState} from 'react'
import {motion, AnimatePresence} from 'motion/react'
import { IconSearch, IconX } from '@tabler/icons-react';

function TabAnimation() {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <motion.div className='w-96 h-60 bg-neutral-100 rounded-lg shadow-lg p-4 flex items-center justify-center'>
            <motion.div
                className='bg-neutral-300 rounded-full flex items-center justify-center gap-10 px-10 py-2'
                layout
                layoutId='container'
                transition={{
                    type: "spring",
                    damping: 6,
                    stiffness: 230,
                    mass: 0.2,
                }}
            >
                <motion.div
                onClick={() => setIsExpanded(!isExpanded)}
                layoutId='tab1'
                className='text-lg'>
                    <motion.p layoutId='tab1-content'>TAB1</motion.p>
                </motion.div>
                <motion.div layoutId='tab3' className={`text-lg ${isExpanded ? 'hidden' : ''}`}>
                    <motion.p layoutId='tab3-content'>TAB3</motion.p>
                </motion.div>
                <motion.div layoutId='tab2' className={`text-lg ${isExpanded ? 'hidden' : ''}`}>
                    <motion.p layoutId='tab2-content'>TAB2</motion.p>
                </motion.div>
            </motion.div>

        </motion.div>

    )

}

export default TabAnimation
