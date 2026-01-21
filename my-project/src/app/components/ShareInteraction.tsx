
'use client';

import React from 'react'
import { IconEdit, IconShare, IconMessageReport, IconNote, IconX, IconStar, IconHeart, IconMessageCircle, IconRepeat } from '@tabler/icons-react';
import {AnimatePresence, motion} from 'motion/react'

const actionItems = [
    {
        icon: <IconShare size={24} />,
        label: 'Share',
        selectedItem: 'share'
    },
    {
        icon: <IconNote size={24} />,
        label: 'Note',
        selectedItem: 'note'
    },
    {
        icon: <IconMessageReport size={24} />,
        label: 'Report',
        selectedItem: 'report'
    }
]

function ShareInteraction() {
    const [isMainButtonClicked, setIsMainButtonClicked] = React.useState(false);
    const [selectedActionItem, setSelectedActionItem] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSubmissionSuccessful, setIsSubmissionSuccessful] = React.useState(false);

    const handleReportSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmissionSuccessful(true);
        }, 2000);
        
        setTimeout(() => {
            setIsMainButtonClicked(false);
            setSelectedActionItem(null);
            setIsSubmissionSuccessful(false);
        }, 3500);
    }

  return (
    <div className=''>
        
        <div className='relative overflow-hidden h-[550px] w-96 bg-white rounded-xl border border-neutral-200 flex flex-col items-center p-4 justify-start shadow-sm'>

            {/* Content Card - Social Post Mock */}
            {/* X Feed Content - Multiple Posts */}
            <div className='w-full h-full overflow-y-auto scrollbar-hide space-y-0'>
                
                {/* Post 1 - Text + Image */}
                <div className='w-full bg-white border-b border-neutral-200 p-4 hover:bg-neutral-50 transition-colors cursor-pointer'>
                    <div className='flex gap-3'>
                        <div className='h-10 w-10 rounded-full bg-neutral-300 flex items-center justify-center text-white font-semibold flex-shrink-0'>
                            JD
                        </div>
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-1 mb-1'>
                                <span className='font-bold text-sm text-neutral-900'>John Developer</span>
                                <svg className='w-4 h-4 text-blue-500' viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484z"/>
                                </svg>
                                <span className='text-neutral-500 text-sm'>@johndev · 2h</span>
                            </div>
                            <div className='text-neutral-900 text-[15px] leading-relaxed mb-2'>
                                Just shipped a new feature with smooth animations using Framer Motion. The difference in user experience is incredible! 🚀
                                <br/><br/>
                                Small details make a huge impact on how your app feels.
                            </div>
                            <div className='rounded-2xl overflow-hidden border border-neutral-200 mb-3'>
                                <div className='w-full h-48 bg-neutral-300 flex items-center justify-center'>
                                </div>
                            </div>
                            <div className='flex items-center justify-between max-w-md text-neutral-500 text-sm'>
                                <div className='flex items-center gap-2 hover:text-blue-500 transition-colors group cursor-pointer'>
                                    <IconMessageCircle size={18} className='group-hover:bg-blue-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                    <span>45</span>
                                </div>
                                <div className='flex items-center gap-2 hover:text-green-500 transition-colors group cursor-pointer'>
                                    <IconRepeat size={18} className='group-hover:bg-green-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                    <span>89</span>
                                </div>
                                <div className='flex items-center gap-2 hover:text-red-500 transition-colors group cursor-pointer'>
                                    <IconHeart size={18} className='group-hover:bg-red-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                    <span>234</span>
                                </div>
                                <div className='flex items-center gap-2 hover:text-blue-500 transition-colors group cursor-pointer'>
                                    <IconShare size={18} className='group-hover:bg-blue-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Post 2 - Short Text */}
                <div className='w-full bg-white border-b border-neutral-200 p-4 hover:bg-neutral-50 transition-colors cursor-pointer'>
                    <div className='flex gap-3'>
                        <div className='h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold flex-shrink-0'>
                            SK
                        </div>
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-1 mb-1'>
                                <span className='font-bold text-sm text-neutral-900'>Sarah Kim</span>
                                <span className='text-neutral-500 text-sm'>@sarahcodes · 5h</span>
                            </div>
                            <div className='text-neutral-900 text-[15px] leading-relaxed mb-3'>
                                Hot take: TypeScript adds more complexity than value for small teams.
                                <br/><br/>
                                Change my mind. 👇
                            </div>
                            <div className='flex items-center justify-between max-w-md text-neutral-500 text-sm'>
                                <div className='flex items-center gap-2 hover:text-blue-500 transition-colors group cursor-pointer'>
                                    <IconMessageCircle size={18} className='group-hover:bg-blue-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                    <span>128</span>
                                </div>
                                <div className='flex items-center gap-2 hover:text-green-500 transition-colors group cursor-pointer'>
                                    <IconRepeat size={18} className='group-hover:bg-green-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                    <span>34</span>
                                </div>
                                <div className='flex items-center gap-2 hover:text-red-500 transition-colors group cursor-pointer'>
                                    <IconHeart size={18} className='group-hover:bg-red-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                    <span>89</span>
                                </div>
                                <div className='flex items-center gap-2 hover:text-blue-500 transition-colors group cursor-pointer'>
                                    <IconShare size={18} className='group-hover:bg-blue-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Post 3 - Thread Preview */}
                <div className='w-full bg-white border-b border-neutral-200 p-4 hover:bg-neutral-50 transition-colors cursor-pointer'>
                    <div className='flex gap-3'>
                        <div className='h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-semibold flex-shrink-0'>
                            MC
                        </div>
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-1 mb-1'>
                                <span className='font-bold text-sm text-neutral-900'>Mike Chen</span>
                                <svg className='w-4 h-4 text-blue-500' viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484z"/>
                                </svg>
                                <span className='text-neutral-500 text-sm'>@mikechen · 8h</span>
                            </div>
                            <div className='text-neutral-900 text-[15px] leading-relaxed mb-2'>
                                How I went from $50/hr to $200/hr as a freelance developer:
                                <br/><br/>
                                A thread 🧵
                            </div>
                            <div className='text-blue-500 text-[15px] mb-3'>
                                Show this thread
                            </div>
                            <div className='flex items-center justify-between max-w-md text-neutral-500 text-sm'>
                                <div className='flex items-center gap-2 hover:text-blue-500 transition-colors group cursor-pointer'>
                                    <IconMessageCircle size={18} className='group-hover:bg-blue-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                    <span>67</span>
                                </div>
                                <div className='flex items-center gap-2 hover:text-green-500 transition-colors group cursor-pointer'>
                                    <IconRepeat size={18} className='group-hover:bg-green-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                    <span>156</span>
                                </div>
                                <div className='flex items-center gap-2 hover:text-red-500 transition-colors group cursor-pointer'>
                                    <IconHeart size={18} className='group-hover:bg-red-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                    <span>445</span>
                                </div>
                                <div className='flex items-center gap-2 hover:text-blue-500 transition-colors group cursor-pointer'>
                                    <IconShare size={18} className='group-hover:bg-blue-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Post 4 - Code Snippet Preview */}
                <div className='w-full bg-white border-b border-neutral-200 p-4 hover:bg-neutral-50 transition-colors cursor-pointer'>
                    <div className='flex gap-3'>
                        <div className='h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0'>
                            AL
                        </div>
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-1 mb-1'>
                                <span className='font-bold text-sm text-neutral-900'>Alex Lee</span>
                                <span className='text-neutral-500 text-sm'>@alexlee · 12h</span>
                            </div>
                            <div className='text-neutral-900 text-[15px] leading-relaxed mb-2'>
                                Clean way to handle API errors in Next.js:
                            </div>
                            <div className='bg-neutral-900 rounded-lg p-3 mb-3 font-mono text-xs text-green-400'>
                                <div>try &#123;</div>
                                <div className='ml-4'>const data = await fetch(...)</div>
                                <div>&#125; catch (error) &#123;</div>
                                <div className='ml-4'>return &#123; error: true &#125;</div>
                                <div>&#125;</div>
                            </div>
                            <div className='flex items-center justify-between max-w-md text-neutral-500 text-sm'>
                                <div className='flex items-center gap-2 hover:text-blue-500 transition-colors group cursor-pointer'>
                                    <IconMessageCircle size={18} className='group-hover:bg-blue-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                    <span>23</span>
                                </div>
                                <div className='flex items-center gap-2 hover:text-green-500 transition-colors group cursor-pointer'>
                                    <IconRepeat size={18} className='group-hover:bg-green-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                    <span>78</span>
                                </div>
                                <div className='flex items-center gap-2 hover:text-red-500 transition-colors group cursor-pointer'>
                                    <IconHeart size={18} className='group-hover:bg-red-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                    <span>312</span>
                                </div>
                                <div className='flex items-center gap-2 hover:text-blue-500 transition-colors group cursor-pointer'>
                                    <IconShare size={18} className='group-hover:bg-blue-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Blur Overlay */}
            <AnimatePresence>
                {isMainButtonClicked && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className='absolute inset-0 backdrop-blur-md bg-black/40 z-10 pointer-events-none'
                    />
                )}
            </AnimatePresence>

            {/* Form Popup */}
            {selectedActionItem !== null && (
            <motion.div className='absolute top-4 flex items-center justify-center z-40'>
                <AnimatePresence>
                    {selectedActionItem === 'report' && (
                        <motion.div layoutId='report-form' className='bg-white p-4 rounded-md border border-neutral-300 w-88 flex space-y-2 flex-col shadow-lg' 
                            initial={{opacity: 0, y: -20}}
                            animate={{opacity: 1, y: 0, transition: {type: 'spring', stiffness: 300, damping: 10, duration: 0.3}}}
                            exit={{opacity: 0, y: -20, transition: {ease: 'easeIn', duration: 0.2}}}
                        >
                            <textarea 
    placeholder='Describe the issue in detail...' 
    className='p-3 border border-neutral-300 rounded-lg w-full h-24 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-neutral-50 focus:bg-white transition-all duration-200 text-sm text-neutral-800 shadow-sm hover:border-neutral-400'
/>
                            <motion.div layoutId='report-form-actions' className='flex items-end justify-end w-full'>
                                <motion.button layoutId='report-form-submit' onClick={() => handleReportSubmit()} className={`ml-2 ${isSubmitting ? ' cursor-not-allowed' : ''} px-4 py-2 bg-blue-600 text-white rounded-md font-medium tracking-tighter uppercase hover:bg-blue-700 transition-colors`}>
                                    {isSubmitting ? (
                                        <>
                                            {"Submitt"}
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
                                    ) : isSubmissionSuccessful ? (
                                        <>
                                            {"Submit"}
                                            {["t", "e", "d"].map((letter, index) => (
                                                <motion.span
                                                    key={`ted-${index}`}
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
                                    ) : (
                                        "Submit"
                                    )}
                                </motion.button>
                            </motion.div>
                            
                        </motion.div>
                    )}
                    {selectedActionItem === 'note' && (
                        <motion.div layoutId='report-form' className='bg-white p-4 rounded-md border border-neutral-300 w-88 flex space-y-2 flex-col shadow-lg' 
                            initial={{opacity: 0, y: -20}}
                            animate={{opacity: 1, y: 0, transition: {type: 'spring', stiffness: 300, damping: 10, duration: 0.3}}}
                            exit={{opacity: 0, y: -20, transition: {ease: 'easeIn', duration: 0.2}}}
                        >
                            <textarea 
    placeholder='Leave a feedback for us..' 
    className='p-3 border border-neutral-300 rounded-lg w-full h-24 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-neutral-50 focus:bg-white transition-all duration-200 text-sm text-neutral-800 shadow-sm hover:border-neutral-400'
/>
                            {/* star rating system */}
                            <div className='flex items-center space-x-1'>
                                {[...Array(5)].map((_, index) => (
                                    <button key={index} className='p-2 hover:text-yellow-500 transition-colors'>
                                        <IconStar size={20} />
                                    </button>
                                ))}
                            </div>
                            <motion.div layoutId='report-form-actions' className='flex items-end justify-end w-full'>
                                <motion.button layoutId='report-form-submit' onClick={() => handleReportSubmit()} className={`ml-2 ${isSubmitting ? ' cursor-not-allowed' : ''} px-4 py-2 bg-blue-600 text-white rounded-md font-medium tracking-tighter uppercase hover:bg-blue-700 transition-colors`}>
                                    {isSubmitting ? (
                                        <>
                                            {"Submitt"}
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
                                    ) : isSubmissionSuccessful ? (
                                        <>
                                            {"Submit"}
                                            {["t", "e", "d"].map((letter, index) => (
                                                <motion.span
                                                    key={`ted-${index}`}
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
                                    ) : (
                                        "Submit"
                                    )}
                                </motion.button>
                            </motion.div>
                            
                        </motion.div>
                    )}
                    {selectedActionItem === 'share' && (
                        <motion.div layoutId='report-form' className='bg-white p-4 rounded-md border border-neutral-300 w-88 flex space-y-3 flex-col shadow-lg' 
                            initial={{opacity: 0, y: -20}}
                            animate={{opacity: 1, y: 0, transition: {type: 'spring', stiffness: 300, damping: 10, duration: 0.3}}}
                            exit={{opacity: 0, y: -20, transition: {ease: 'easeIn', duration: 0.2}}}
                        >
                            <div className='text-sm font-semibold text-neutral-800'>Share this post</div>
                            <div className='flex flex-col gap-2'>
                                <button className='px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors'>
                                    Share on Twitter
                                </button>
                                <button className='px-4 py-2 bg-neutral-100 text-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-200 transition-colors'>
                                    Copy Link
                                </button>
                                <button className='px-4 py-2 bg-neutral-100 text-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-200 transition-colors'>
                                    Send via Email
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            )}

            {/* Action Buttons */}
            <AnimatePresence>
            {
                isMainButtonClicked &&
                <motion.div className='flex flex-row'>
                    {actionItems.map((item, index) => (
                        <motion.div 
                            key={index}
                            initial={{opacity: 0, y: 20, filter: 'blur(4px)'}}
                            animate={{opacity: 1, y: 0, filter: 'blur(0px)', transition: {type: 'spring', stiffness: 300, damping: 15, duration: 0.5, delay: index * 0.1}}}
                            exit={{opacity: 0, y: 20, filter: 'blur(4px)', transition: {type: 'spring', stiffness: 300, damping: 30, delay: (actionItems.length - index - 1) * 0.1}}}
                            style={{bottom: `${50 + index * 50}px`, right: `${8}px`}}
                            onClick={() => setSelectedActionItem(selectedActionItem === item.selectedItem ? null : item.selectedItem)}
                            className='h-12 w-12 absolute bg-white rounded-full flex items-center justify-center gap-2 border border-neutral-300 mb-2 cursor-pointer hover:shadow-md transition-shadow z-50'
                        >
                            {item.icon}
                        </motion.div>

                    ))}
                </motion.div>
            }
            </AnimatePresence>

            {/* Main Action Button */}
            <div onClick={() => setIsMainButtonClicked(!isMainButtonClicked)} className='h-12 w-12 bg-white rounded-full border border-neutral-300 flex items-center justify-center absolute bottom-2 right-2 cursor-pointer hover:shadow-lg transition-shadow z-50'>
                {isMainButtonClicked ? 
                    <motion.span 
                    initial={{ rotate: 0, filter: 'blur(4px)'}}
                    animate={{ rotate: 180, filter: 'blur(0px)'}}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <IconX size={24} />
                    </motion.span> : 
                    <motion.span
                    initial={{ rotate: 0, filter: 'blur(4px)'}}
                    animate={{ rotate: 0, filter: 'blur(0px)'}}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <IconEdit size={24} />
                    </motion.span>
                }
            </div>

        </div>

        {/* Debug Display */}
        {/* <div className='h-12 w-48 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer'>
            {selectedActionItem === null ? 'null' : selectedActionItem}
        </div>        */}
    </div>
  )
}

export default ShareInteraction


export function ShareInteractionBefore() {
    const [isMainButtonClicked, setIsMainButtonClicked] = React.useState(false);
    const [selectedActionItem, setSelectedActionItem] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSubmissionSuccessful, setIsSubmissionSuccessful] = React.useState(false);

    const handleReportSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmissionSuccessful(true);
        }, 2000);
        
        setTimeout(() => {
            setIsMainButtonClicked(false);
            setSelectedActionItem(null);
            setIsSubmissionSuccessful(false);
        }, 3500);
    }

  return (
    <div className='flex flex-col items-center gap-4 bg-neutral-100'>
        
        <div className='relative overflow-hidden h-[550px] w-96 bg-white rounded-xl border border-neutral-200 flex flex-col items-center p-4 justify-start shadow-sm'>

            {/* Content Card - Social Post Mock */}
            <div className='w-full bg-white border border-neutral-200 rounded-lg p-4 shadow-sm z-0'>
                {/* Header Row */}
                <div className='flex items-center gap-3 mb-3'>
                    <div className='h-10 w-10 rounded-full bg-neutral-500 flex items-center justify-center text-white font-semibold'>
                        JD
                    </div>
                    <div className='flex-1'>
                        <div className='font-semibold text-sm text-neutral-900'>John Developer</div>
                        <div className='text-xs text-neutral-500'>@johndev · 2h</div>
                    </div>
                </div>

                {/* Post Content */}
                <div className='text-neutral-800 text-sm leading-relaxed mb-3'>
                    Just shipped a new feature with smooth animations using Framer Motion. The difference in user experience is incredible! 🚀
                    
                    Small details make a huge impact on how your app feels.
                </div>

                {/* Engagement Metrics */}
                <div className='flex items-center gap-6 text-neutral-500 text-sm pt-3 border-t border-neutral-100'>
                    <div className='flex items-center gap-1.5 hover:text-red-500 cursor-pointer'>
                        <IconHeart size={18} />
                        <span>234</span>
                    </div>
                    <div className='flex items-center gap-1.5 hover:text-blue-500 cursor-pointer'>
                        <IconMessageCircle size={18} />
                        <span>45</span>
                    </div>
                    <div className='flex items-center gap-1.5 hover:text-green-500 cursor-pointer'>
                        <IconRepeat size={18} />
                        <span>89</span>
                    </div>
                </div>
            </div>


            <div className='w-full bg-white border-b border-neutral-200 p-4 hover:bg-neutral-50 transition-colors cursor-pointer'>
                    <div className='flex gap-3'>
                        <div className='h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold flex-shrink-0'>
                            SK
                        </div>
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-1 mb-1'>
                                <span className='font-bold text-sm text-neutral-900'>Sarah Kim</span>
                                <span className='text-neutral-500 text-sm'>@sarahcodes · 5h</span>
                            </div>
                            <div className='text-neutral-900 text-[15px] leading-relaxed mb-3'>
                                Hot take: TypeScript adds more complexity than value for small teams.
                                <br/><br/>
                                Change my mind. 👇
                            </div>
                            <div className='flex items-center justify-between max-w-md text-neutral-500 text-sm'>
                                <div className='flex items-center gap-2 hover:text-blue-500 transition-colors group cursor-pointer'>
                                    <IconMessageCircle size={18} className='group-hover:bg-blue-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                    <span>128</span>
                                </div>
                                <div className='flex items-center gap-2 hover:text-green-500 transition-colors group cursor-pointer'>
                                    <IconRepeat size={18} className='group-hover:bg-green-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                    <span>34</span>
                                </div>
                                <div className='flex items-center gap-2 hover:text-red-500 transition-colors group cursor-pointer'>
                                    <IconHeart size={18} className='group-hover:bg-red-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                    <span>89</span>
                                </div>
                                <div className='flex items-center gap-2 hover:text-blue-500 transition-colors group cursor-pointer'>
                                    <IconShare size={18} className='group-hover:bg-blue-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Post 3 - Thread Preview */}
                <div className='w-full bg-white border-b border-neutral-200 p-4 hover:bg-neutral-50 transition-colors cursor-pointer'>
                    <div className='flex gap-3'>
                        <div className='h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-semibold flex-shrink-0'>
                            MC
                        </div>
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-1 mb-1'>
                                <span className='font-bold text-sm text-neutral-900'>Mike Chen</span>
                                <svg className='w-4 h-4 text-blue-500' viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484z"/>
                                </svg>
                                <span className='text-neutral-500 text-sm'>@mikechen · 8h</span>
                            </div>
                            <div className='text-neutral-900 text-[15px] leading-relaxed mb-2'>
                                How I went from $50/hr to $200/hr as a freelance developer:
                                <br/><br/>
                                A thread 🧵
                            </div>
                            <div className='text-blue-500 text-[15px] mb-3'>
                                Show this thread
                            </div>
                            <div className='flex items-center justify-between max-w-md text-neutral-500 text-sm'>
                                <div className='flex items-center gap-2 hover:text-blue-500 transition-colors group cursor-pointer'>
                                    <IconMessageCircle size={18} className='group-hover:bg-blue-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                    <span>67</span>
                                </div>
                                <div className='flex items-center gap-2 hover:text-green-500 transition-colors group cursor-pointer'>
                                    <IconRepeat size={18} className='group-hover:bg-green-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                    <span>156</span>
                                </div>
                                <div className='flex items-center gap-2 hover:text-red-500 transition-colors group cursor-pointer'>
                                    <IconHeart size={18} className='group-hover:bg-red-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                    <span>445</span>
                                </div>
                                <div className='flex items-center gap-2 hover:text-blue-500 transition-colors group cursor-pointer'>
                                    <IconShare size={18} className='group-hover:bg-blue-500/10 rounded-full p-2 w-8 h-8 transition-colors' />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            {/* NO BLUR OVERLAY - Just hard content block */}

            {/* Form Popup - Instant appearance, no animation */}
            {selectedActionItem !== null && (
            <div className='absolute top-4 flex items-center justify-center z-40'>
                    {selectedActionItem === 'report' && (
                        <div className='bg-white p-4 rounded-md border border-neutral-300 w-88 flex space-y-2 flex-col shadow-lg'>
                            <input type="text" placeholder='Report your Issue' className='p-2 border border-neutral-300 rounded-md w-full h-24 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500'/>
                            <div className='flex items-end justify-end w-full'>
                                <button onClick={() => handleReportSubmit()} className={`ml-2 ${isSubmitting ? 'cursor-not-allowed' : ''} px-4 py-2 bg-blue-600 text-white rounded-md font-medium tracking-tighter uppercase`}>
                                    {isSubmitting ? (
                                        "SUBMITTING"
                                    ) : isSubmissionSuccessful ? (
                                        "SUBMITTED"
                                    ) : (
                                        "SUBMIT"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                    {selectedActionItem === 'note' && (
                        <div className='bg-white p-4 rounded-md border border-neutral-300 w-88 flex space-y-2 flex-col shadow-lg'>
                            <input type="text" placeholder='Leave a feedback for us..' className='p-2 border border-neutral-300 rounded-md w-full h-24 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500'/>
                            {/* star rating system */}
                            <div className='flex items-center space-x-1'>
                                {[...Array(5)].map((_, index) => (
                                    <button key={index} className='p-2'>
                                        <IconStar size={20} />
                                    </button>
                                ))}
                            </div>
                            <div className='flex items-end justify-end w-full'>
                                <button onClick={() => handleReportSubmit()} className={`ml-2 ${isSubmitting ? 'cursor-not-allowed' : ''} px-4 py-2 bg-blue-600 text-white rounded-md font-medium tracking-tighter uppercase`}>
                                    {isSubmitting ? (
                                        "SUBMITTING"
                                    ) : isSubmissionSuccessful ? (
                                        "SUBMITTED"
                                    ) : (
                                        "SUBMIT"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                    {selectedActionItem === 'share' && (
                        <div className='bg-white p-4 rounded-md border border-neutral-300 w-88 flex space-y-3 flex-col shadow-lg'>
                            <div className='text-sm font-semibold text-neutral-800'>Share this post</div>
                            <div className='flex flex-col gap-2'>
                                <button className='px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium'>
                                    Share on Twitter
                                </button>
                                <button className='px-4 py-2 bg-neutral-100 text-neutral-700 rounded-md text-sm font-medium'>
                                    Copy Link
                                </button>
                                <button className='px-4 py-2 bg-neutral-100 text-neutral-700 rounded-md text-sm font-medium'>
                                    Send via Email
                                </button>
                            </div>
                        </div>
                    )}
            </div>
            )}

            {/* Action Buttons - All appear at once, no stagger */}
            {isMainButtonClicked && (
                <div className='flex flex-row'>
                    {actionItems.map((item, index) => (
                        <div 
                            key={index}
                            style={{bottom: `${50 + index * 50}px`, right: `${8}px`}}
                            onClick={() => setSelectedActionItem(selectedActionItem === item.selectedItem ? null : item.selectedItem)}
                            className='h-12 w-12 absolute bg-white rounded-full flex items-center justify-center gap-2 border border-neutral-300 mb-2 cursor-pointer z-50'
                        >
                            {item.icon}
                        </div>
                    ))}
                </div>
            )}

            {/* Main Action Button - No rotation animation */}
            <div onClick={() => setIsMainButtonClicked(!isMainButtonClicked)} className='h-12 w-12 bg-white rounded-full border border-neutral-300 flex items-center justify-center absolute bottom-2 right-2 cursor-pointer z-50'>
                {isMainButtonClicked ? <IconX size={24} /> : <IconEdit size={24} />}
            </div>

        </div>     
    </div>
  )
}

