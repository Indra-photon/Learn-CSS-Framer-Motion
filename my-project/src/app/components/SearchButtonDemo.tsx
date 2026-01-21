'use client'

import React, {useState} from 'react'
import {motion, AnimatePresence} from 'motion/react'
import { IconSearch, IconX, IconBook, IconCode, IconFileText, IconBrandReact } from '@tabler/icons-react';

function SearchButtonDemo() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const mockItems = [
        { id: 1, title: 'Getting Started', category: 'Docs', icon: IconBook },
        { id: 2, title: 'API Reference', category: 'Docs', icon: IconCode },
        { id: 3, title: 'React Components', category: 'Components', icon: IconBrandReact },
        { id: 4, title: 'Installation Guide', category: 'Guides', icon: IconFileText },
        { id: 5, title: 'TypeScript Support', category: 'Docs', icon: IconCode },
        { id: 6, title: 'Best Practices', category: 'Guides', icon: IconBook },
        { id: 7, title: 'Advanced Techniques', category: 'Guides', icon: IconFileText },
        { id: 8, title: 'Component Library', category: 'Components', icon: IconBrandReact },
    ];

        const filteredItems = searchQuery.trim() === '' 
        ? mockItems.slice(0, 4) // Show first 4 items when empty
        : mockItems.filter(item => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())
          );

    return (
        <motion.div className='w-96 h-[450px] bg-neutral-300 rounded-lg shadow-lg p-4 flex items-start justify-center relative overflow-hidden'>
            <motion.div
                className=' rounded-full flex items-center justify-center gap-2 p-3 relative cursor-pointer'
                layout
                layoutId='container'
                transition={{
                    type: "spring",
                    damping: 15,
                    stiffness: 230,
                    mass: 0.2,
                }}
                onClick={() => setIsExpanded(!isExpanded)}
            >

                <motion.div layoutId='parent' className='flex flex-row items-center'>
                    <motion.div
                      key="close-icon"
                      layoutId='icon'
                      className='flex items-center justify-center bg-neutral-100 p-2 rounded-full'
                    >
                      <AnimatePresence mode='wait'>
                        <motion.div
                            key={isExpanded ? "close-icon" : "search-icon"}
                            initial={{ opacity: 0, rotate: isExpanded ? -90 : 90, filter: "blur(4px)" }}
                            animate={{ opacity: 1, rotate: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, rotate: isExpanded ? 90 : -90, filter: "blur(4px)" }}
                            transition={{ duration: 0.2 }}
                        >
                            {isExpanded ? <IconX className='w-6 h-6 text-neutral-800' /> : <IconSearch className='w-6 h-6 text-neutral-800' />}
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>
                </motion.div>

                <motion.input
                    type="text"
                    placeholder='Search...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`bg-white ${isExpanded ? 'w-64' : 'w-0 hidden'} outline-none h-[36px] m-2 border-neutral-200 rounded-full text-neutral-700 placeholder:text-neutral-400 pl-5`}
                    onClick={(e) => e.stopPropagation()}
                    transition={{
                        type: "spring",
                        damping: 20,
                        stiffness: 230,
                        mass: 1.2,
                    }}
                />

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{
                                type: "spring",
                                damping: 20,
                                stiffness: 300,
                            }}
                            className='absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl overflow-hidden border border-neutral-200'
                        >
                            <AnimatePresence mode='popLayout'>
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item, index) => {
                                        const Icon = item.icon;
                                        return (
                                            <motion.div
                                                layout
                                                key={item.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{
                                                    type: "spring",
                                                    damping: 25,
                                                    stiffness: 300,
                                                    delay: index * 0.05,
                                                }}
                                                className='flex items-center gap-3 p-3 hover:bg-neutral-50 cursor-pointer border-b border-neutral-100 last:border-b-0 transition-colors'
                                                onClick={() => {
                                                    console.log('Selected:', item.title);
                                                    setSearchQuery('');
                                                    setIsExpanded(false);
                                                }}
                                            >
                                                <div className='bg-neutral-100 p-2 rounded-md'>
                                                    <Icon className='w-5 h-5 text-neutral-600' />
                                                </div>
                                                <div className='flex-1'>
                                                    <div className='text-sm font-medium text-neutral-800'>{item.title}</div>
                                                    <div className='text-xs text-neutral-500'>{item.category}</div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className='p-6 text-center text-neutral-500 text-sm'
                                    >
                                        No results found
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

        </motion.div>

    )

}

export default SearchButtonDemo


// 'use client'

// import React, {useState} from 'react'
// import {motion, AnimatePresence} from 'motion/react'
// import { IconSearch, IconX, IconBook, IconCode, IconFileText, IconBrandReact } from '@tabler/icons-react';

// // Mock data - like a technical docs site
// const mockItems = [
//     { id: 1, title: 'Getting Started', category: 'Docs', icon: IconBook },
//     { id: 2, title: 'API Reference', category: 'Docs', icon: IconCode },
//     { id: 3, title: 'React Components', category: 'Components', icon: IconBrandReact },
//     { id: 4, title: 'Installation Guide', category: 'Guides', icon: IconFileText },
//     { id: 5, title: 'TypeScript Support', category: 'Docs', icon: IconCode },
//     { id: 6, title: 'Best Practices', category: 'Guides', icon: IconBook },
// ];

// function TabAnimation() {
//     const [isExpanded, setIsExpanded] = useState(false);
//     const [searchQuery, setSearchQuery] = useState('');

//     // Filter items based on search query
    // const filteredItems = searchQuery.trim() === '' 
    //     ? mockItems.slice(0, 4) // Show first 4 items when empty
    //     : mockItems.filter(item => 
    //         item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //         item.category.toLowerCase().includes(searchQuery.toLowerCase())
    //       );

//     return (
//         <motion.div className='w-96 h-96 bg-neutral-300 rounded-lg shadow-lg p-4 flex items-start justify-center'>
//             <div className='relative'>
//                 <motion.div
//                     className='rounded-full flex items-center justify-center gap-2 p-3 bg-white shadow-md'
//                     layout
//                     layoutId='container'
//                     transition={{
//                         type: "spring",
//                         damping: 15,
//                         stiffness: 230,
//                         mass: 0.2,
//                     }}
//                     onClick={() => setIsExpanded(!isExpanded)}
//                 >
//                     <motion.div layoutId='parent' className='flex flex-row items-center'>
//                         <motion.div
//                           key="close-icon"
//                           layoutId='icon'
//                           className='flex items-center justify-center bg-neutral-100 p-2 rounded-full'
//                         >
//                           <AnimatePresence mode='wait'>
//                             <motion.div
//                                 key={isExpanded ? "close-icon" : "search-icon"}
//                                 initial={{ opacity: 0, rotate: isExpanded ? -90 : 90, filter: "blur(4px)" }}
//                                 animate={{ opacity: 1, rotate: 0, filter: "blur(0px)" }}
//                                 exit={{ opacity: 0, rotate: isExpanded ? 90 : -90, filter: "blur(4px)" }}
//                                 transition={{ duration: 0.2 }}
//                             >
//                                 {isExpanded ? <IconX className='w-6 h-6 text-neutral-800' /> : <IconSearch className='w-6 h-6 text-neutral-800' />}
//                             </motion.div>
//                           </AnimatePresence>
//                         </motion.div>
//                     </motion.div>

//                     <motion.input
//                         type="text"
//                         placeholder='Search...'
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                         className={`bg-transparent ${isExpanded ? 'w-64' : 'w-0 hidden'} outline-none h-[36px] m-2 rounded-full text-neutral-700 placeholder:text-neutral-400 pl-5`}
//                         onClick={(e) => e.stopPropagation()}
//                         transition={{
//                             type: "spring",
//                             damping: 20,
//                             stiffness: 230,
//                             mass: 1.2,
//                         }}
//                     />
//                 </motion.div>

//                 {/* Dropdown Container */}
//                 <AnimatePresence>
//                     {isExpanded && (
//                         <motion.div
//                             initial={{ opacity: 0, y: -10, scale: 0.95 }}
//                             animate={{ opacity: 1, y: 0, scale: 1 }}
//                             exit={{ opacity: 0, y: -10, scale: 0.95 }}
//                             transition={{
//                                 type: "spring",
//                                 damping: 20,
//                                 stiffness: 300,
//                             }}
//                             className='absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl overflow-hidden border border-neutral-200'
//                         >
//                             <AnimatePresence mode='popLayout'>
//                                 {filteredItems.length > 0 ? (
//                                     filteredItems.map((item, index) => {
//                                         const Icon = item.icon;
//                                         return (
//                                             <motion.div
//                                                 key={item.id}
//                                                 initial={{ opacity: 0, y: -20 }}
//                                                 animate={{ opacity: 1, y: 0 }}
//                                                 exit={{ opacity: 0, y: -20 }}
//                                                 transition={{
//                                                     type: "spring",
//                                                     damping: 25,
//                                                     stiffness: 300,
//                                                     delay: index * 0.05,
//                                                 }}
//                                                 className='flex items-center gap-3 p-3 hover:bg-neutral-50 cursor-pointer border-b border-neutral-100 last:border-b-0 transition-colors'
//                                                 onClick={() => {
//                                                     console.log('Selected:', item.title);
//                                                     setSearchQuery('');
//                                                     setIsExpanded(false);
//                                                 }}
//                                             >
//                                                 <div className='bg-neutral-100 p-2 rounded-md'>
//                                                     <Icon className='w-5 h-5 text-neutral-600' />
//                                                 </div>
//                                                 <div className='flex-1'>
//                                                     <div className='text-sm font-medium text-neutral-800'>{item.title}</div>
//                                                     <div className='text-xs text-neutral-500'>{item.category}</div>
//                                                 </div>
//                                             </motion.div>
//                                         );
//                                     })
//                                 ) : (
//                                     <motion.div
//                                         initial={{ opacity: 0, y: -20 }}
//                                         animate={{ opacity: 1, y: 0 }}
//                                         exit={{ opacity: 0, y: -20 }}
//                                         className='p-6 text-center text-neutral-500 text-sm'
//                                     >
//                                         No results found
//                                     </motion.div>
//                                 )}
//                             </AnimatePresence>
//                         </motion.div>
//                     )}
//                 </AnimatePresence>
//             </div>
//         </motion.div>
//     )
// }

// export default TabAnimation