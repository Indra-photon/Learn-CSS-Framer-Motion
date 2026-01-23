
// 'use client'

// import React, { useState } from 'react'
// import { IconPlus, IconSearch, IconX } from '@tabler/icons-react'
// import { motion, AnimatePresence } from 'motion/react'

// const tasklist : { id: number, content: string }[] = []

// function AddTask() {
//     const [isOpen, setIsOpen] = useState(false)
//     const [taskInput, setTaskInput] = useState('')
//     const [tasklist, setTasklist] = useState<{ id: number, content: string }[]>([]) // ✅ State, not constant

//     const handleAddTask = () => {
//         if (taskInput.trim()) {  // ✅ Don't add empty tasks
//             setTasklist([...tasklist, { id: Date.now(), content: taskInput }])  // ✅ Use state setter
//             setTaskInput('')  // Clear input
//         }
//     }
//     const handleKeyPress = (e: React.KeyboardEvent) => {
//         if (e.key === 'Enter') {
//             handleAddTask()
//         }
//     }
//     const handleDeleteTask = (id: number) => {
//         setTasklist(tasklist.filter(task => task.id !== id))
//     }
    
//     return (
//         <div className='bg-neutral-300 p-6 rounded-lg shadow-lg w-80 h-96 flex flex-col justify-start items-center m-80'>
//             <motion.div layout className='flex w-full flex-col gap-3 items-center'>
                
//                 <motion.div className='flex flex-row gap-3 items-center'>
//                     <motion.button 
//                         layout
//                         onClick={() => setIsOpen(!isOpen)}
//                         className='bg-neutral-100 rounded-full p-2 cursor-pointer hover:bg-neutral-200 transition-colors'
//                     >
//                         <AnimatePresence mode='popLayout'>
//                             {isOpen ? (
//                                 <motion.div
//                                     key='icon-x'
//                                     initial={{ rotate: 90, opacity: 0, filter: 'blur(2px)' }}
//                                     animate={{ rotate: 0, opacity: 1, filter: 'blur(0px)' }}
//                                     exit={{ rotate: -90, opacity: 0, filter: 'blur(2px)' }}
//                                     transition={{ duration: 0.2 }}
//                                 >
//                                     <IconX className='text-gray-800' />
//                                 </motion.div>
//                             ) : (
//                                 <motion.div
//                                     key='icon-plus'
//                                     initial={{ opacity: 0, filter: 'blur(2px)' }}
//                                     animate={{ opacity: 1, filter: 'blur(0px)' }}
//                                     exit={{ opacity: 0, filter: 'blur(2px)' }}
//                                     transition={{ duration: 0.2 }}
//                                 >
//                                     <IconPlus className='text-gray-800' />
//                                 </motion.div>
//                             )}
//                         </AnimatePresence>
//                     </motion.button>
                    
//                     <AnimatePresence mode='popLayout'>
//                         {isOpen && (
//                             <motion.div layout key={'input-container'} className='flex flex-row gap-3 items-center'>
//                                 <motion.input 
//                                     layout
//                                     initial={{ opacity: 0, width: 0 }}
//                                     animate={{ opacity: 1, width: '12rem' }}
//                                     exit={{ opacity: 0, width: 0 }}
//                                     transition={{
//                                         type: "spring",
//                                         stiffness: 300,
//                                         damping: 18
//                                     }}
//                                     type="text" 
//                                     placeholder='Add your task...' 
//                                     value={taskInput}  // ✅ Controlled input
//                                     onChange={(e) => setTaskInput(e.target.value)}  // ✅ Update state
//                                     onKeyPress={handleKeyPress}  // ✅ Add on Enter key
//                                     className='rounded-md p-2 outline-none border border-gray-300 bg-neutral-100'
//                                     autoFocus
//                                 />
//                                 <motion.button
//                                     key={'add-button'}
//                                     onClick={handleAddTask}
//                                     initial={{ scale: 0, opacity: 0 }}
//                                     animate={{ scale: 1, opacity: 1 }}
//                                     exit={{ scale: 0, opacity: 0 }}
//                                     transition={{ type: "spring", stiffness: 300, damping: 20 }}
//                                     className='bg-blue-500 text-white rounded-md p-2'
//                                 >
//                                     <IconPlus className='text-white' />
//                                 </motion.button>
//                             </motion.div>

//                         )}
//                     </AnimatePresence>
//                 </motion.div>

//                 <div className='flex flex-col gap-2 w-full'>
//                     <AnimatePresence mode='popLayout'>
//                         {tasklist.map((task) => (
//                             <motion.div
//                                 key={task.id}
//                                 layout
//                                 initial={{ opacity: 0, y: -20, scale: 0.8 }}
//                                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                                 exit={{ opacity: 0, x: -100, scale: 0.8 }}
//                                 transition={{ 
//                                     type: "spring",
//                                     stiffness: 300,
//                                     damping: 25,
//                                     duration: 0.3
//                                 }}
//                                 className='bg-white p-4 rounded-md shadow-md flex items-center flex-row justify-between'
//                             >
//                                 {task.content}
//                                 <span onClick={() => handleDeleteTask(task.id)} className='text-neutral-700'> <IconX /></span>
//                             </motion.div>
//                         ))}
//                     </AnimatePresence>
//                 </div>

//             </motion.div>
//         </div>
//     )
// }

// export default AddTask


'use client'

import React, { useState } from 'react'
import { IconPlus, IconX, IconCheck } from '@tabler/icons-react'
import { motion, AnimatePresence } from 'motion/react'

interface Task {
    id: number
    content: string
    completed: boolean
}

function AddTask() {
    const [isOpen, setIsOpen] = useState(false)
    const [taskInput, setTaskInput] = useState('')
    const [tasklist, setTasklist] = useState<Task[]>([])

    const handleAddTask = () => {
        if (taskInput.trim()) {
            setTasklist([...tasklist, { 
                id: Date.now(), 
                content: taskInput,
                completed: false 
            }])
            setTaskInput('')
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddTask()
        }
        if (e.key === 'Escape') {
            setIsOpen(false)
            setTaskInput('')
        }
    }

    const handleDeleteTask = (id: number) => {
        setTasklist(tasklist.filter(task => task.id !== id))
    }

    const handleToggleComplete = (id: number) => {
        setTasklist(tasklist.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        ))
    }
    
    return (
        <div className='min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6'>
            <div className='bg-white rounded-2xl shadow-xl border border-slate-200/60 w-full max-w-md overflow-hidden'>
                {/* Header */}
                <div className='px-6 py-5 border-b border-slate-200/60'>
                    <h2 className='text-xl font-semibold text-slate-800'>Tasks</h2>
                    <p className='text-sm text-slate-500 mt-0.5'>
                        {tasklist.length === 0 
                            ? 'No tasks yet' 
                            : `${tasklist.filter(t => !t.completed).length} active, ${tasklist.filter(t => t.completed).length} completed`
                        }
                    </p>
                </div>

                {/* Add Task Section */}
                <div className='px-6 py-4 border-b border-slate-200/60 bg-slate-50/30'>
                    <motion.div layout className='flex items-center gap-3'>
                        <motion.button 
                            layout
                            onClick={() => setIsOpen(!isOpen)}
                            className='shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 
                                     hover:from-blue-600 hover:to-blue-700 
                                     shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50
                                     transition-all duration-200 flex items-center justify-center
                                     active:scale-95 group'
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <AnimatePresence mode='wait'>
                                {isOpen ? (
                                    <motion.div
                                        key='icon-x'
                                        initial={{ rotate: 90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: -90, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <IconX size={20} className='text-white' strokeWidth={2.5} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key='icon-plus'
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <IconPlus size={20} className='text-white' strokeWidth={2.5} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                        
                        <AnimatePresence mode='wait'>
                            {isOpen && (
                                <motion.div 
                                    layout 
                                    className='flex-1 flex items-center gap-2'
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30
                                    }}
                                >
                                    <input 
                                        type="text" 
                                        placeholder='What needs to be done?' 
                                        value={taskInput}
                                        onChange={(e) => setTaskInput(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        className='flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200 
                                                 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                                                 outline-none transition-all duration-200
                                                 text-slate-700 placeholder:text-slate-400 text-sm'
                                        autoFocus
                                    />
                                    <motion.button
                                        onClick={handleAddTask}
                                        disabled={!taskInput.trim()}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className='px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 
                                                 disabled:bg-slate-200 disabled:cursor-not-allowed
                                                 text-white font-medium text-sm shadow-md
                                                 transition-all duration-200 active:scale-95
                                                 disabled:shadow-none'
                                    >
                                        Add
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Task List */}
                <div className='px-6 py-4 min-h-24 max-h-96 overflow-y-auto'>
                    <AnimatePresence mode='popLayout'>
                        {tasklist.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className='text-center py-12'
                            >
                                <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center'>
                                    <IconCheck size={32} className='text-slate-300' strokeWidth={2} />
                                </div>
                                <p className='text-slate-400 text-sm'>No tasks yet. Add one to get started!</p>
                            </motion.div>
                        ) : (
                            <div className='space-y-2 min-h-90'>
                                {tasklist.map((task) => (
                                    <motion.div
                                        key={task.id}
                                        layout
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: -100, scale: 0.9 }}
                                        transition={{ 
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 30
                                        }}
                                        className='group relative'
                                    >
                                        <div className={`
                                            flex items-center gap-3 px-4 py-3 rounded-xl 
                                            border transition-all duration-200
                                            ${task.completed 
                                                ? 'bg-slate-50 border-slate-200' 
                                                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                                            }
                                        `}>
                                            {/* Checkbox */}
                                            <button
                                                onClick={() => handleToggleComplete(task.id)}
                                                className={`
                                                    shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center
                                                    transition-all duration-200
                                                    ${task.completed 
                                                        ? 'bg-blue-500 border-blue-500' 
                                                        : 'border-slate-300 hover:border-blue-500'
                                                    }
                                                `}
                                            >
                                                <AnimatePresence>
                                                    {task.completed && (
                                                        <motion.div
                                                            initial={{ scale: 0, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            exit={{ scale: 0, opacity: 0 }}
                                                            transition={{ duration: 0.15 }}
                                                        >
                                                            <IconCheck size={14} className='text-white' strokeWidth={3} />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </button>

                                            {/* Task Content */}
                                            <span className={`
                                                flex-1 text-sm transition-all duration-200
                                                ${task.completed 
                                                    ? 'text-slate-400 line-through' 
                                                    : 'text-slate-700'
                                                }
                                            `}>
                                                {task.content}
                                            </span>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                className='shrink-0 w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-50
                                                         flex items-center justify-center
                                                         opacity-0 group-hover:opacity-100
                                                         transition-all duration-200
                                                         hover:scale-110 active:scale-95'
                                            >
                                                <IconX size={16} className='text-slate-400 hover:text-red-500' strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

export default AddTask