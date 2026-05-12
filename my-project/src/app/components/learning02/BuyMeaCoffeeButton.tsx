"use client"

import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { IconCoffee, IconPaywall } from '@tabler/icons-react'
import Image from 'next/image'

function Spinner({ size = 20, color = 'rgba(255,255,255,0.65)' }: { size?: number; color?: string }) {
    return (
        <>
            <style>{`
                @keyframes spinner-fade {
                    0%   { opacity: 1; }
                    100% { opacity: 0.15; }
                }
            `}</style>
            <div style={{ width: size, height: size, position: 'relative' }}>
                {Array.from({ length: 12 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            top: '-3.9%',
                            left: '-10%',
                            width: '24%',
                            height: '8%',
                            borderRadius: 6,
                            background: color,
                            transform: `rotate(${i * 30}deg) translate(146%)`,
                            animation: `spinner-fade 1.2s linear infinite`,
                            animationDelay: `${-1.2 + i * 0.1}s`,
                        }}
                    />
                ))}
            </div>
        </>
    )
}

function BuyMeaCoffeeButton() {

    const [isClicked, setIsClicked] = React.useState(false)
    const [cardState, setCardState] = React.useState<'idle' | 'loading' | 'success'>('idle')

    const handlePay = () => {
        setCardState('loading')
        setTimeout(() => setCardState('success'), 1500)
        setTimeout(() => {
            setIsClicked(false)
            setCardState('idle')
        }, 3500)
    }

    return (
        <div className='flex items-center justify-center h-screen'>

            <motion.div
                layoutId='buy-coffee-button-wrapper'
                role='button'
                onClick={() => setIsClicked(true)}
                style={{ borderRadius: 8 }}
                className='flex items-center gap-2 h-9 px-3 bg-[#1c1c1e] border border-[#2c2c2e] text-white text-sm font-medium cursor-pointer select-none shadow-md'
            >
                <motion.span layoutId='buy-coffee-button-icon'>
                    <IconCoffee size={16} />
                </motion.span>
                <motion.span layoutId='buy-coffee-button-text'>Buy me a coffee</motion.span>
            </motion.div>

            <AnimatePresence>
                {isClicked && (
                    <motion.div
                        key='buy-coffee-card'
                        layoutId='buy-coffee-button-wrapper'
                        style={{ borderRadius: 16 }}
                        className='absolute w-[320px] bg-[#1c1c1e] border border-[#2c2c2e] overflow-hidden shadow-2xl'
                    >
                        <motion.div
                            initial={{ opacity: 0, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, filter: 'blur(4px)' }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                            {/* Close button — hidden during loading/success */}
                            <AnimatePresence>
                                {cardState === 'idle' && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ type: 'spring', duration: 0.2, bounce: 0 }}
                                        onClick={() => setIsClicked(false)}
                                        className='absolute top-3 right-3 z-10 size-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-white'
                                    >
                                        <svg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                            <path d='M1 1L9 9M9 1L1 9' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
                                        </svg>
                                    </motion.button>
                                )}
                            </AnimatePresence>

                            {/* Fixed height container — no resize between states, only content swaps */}
                            <div className='h-[420px] overflow-hidden'>
                                <AnimatePresence mode='wait'>
                                    {cardState === 'success' && (
                                        <motion.div
                                            key='success'
                                            initial={{ y: -32, opacity: 0, filter: 'blur(4px)' }}
                                            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                                            transition={{ type: 'spring', duration: 0.15, bounce: 0 }}
                                            className='h-full flex flex-col items-center justify-center gap-2 px-6'
                                        >
                                            <svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                                <path d='M27.6 16C27.6 17.5234 27.3 19.0318 26.717 20.4392C26.1341 21.8465 25.2796 23.1253 24.2025 24.2025C23.1253 25.2796 21.8465 26.1341 20.4392 26.717C19.0318 27.3 17.5234 27.6 16 27.6C14.4767 27.6 12.9683 27.3 11.5609 26.717C10.1535 26.1341 8.87475 25.2796 7.79759 24.2025C6.72043 23.1253 5.86598 21.8465 5.28302 20.4392C4.70007 19.0318 4.40002 17.5234 4.40002 16C4.40002 12.9235 5.62216 9.97301 7.79759 7.79759C9.97301 5.62216 12.9235 4.40002 16 4.40002C19.0765 4.40002 22.027 5.62216 24.2025 7.79759C26.3779 9.97301 27.6 12.9235 27.6 16Z' fill='#2090FF' fillOpacity='0.16' />
                                                <path d='M12.1334 16.9667L15.0334 19.8667L19.8667 13.1M27.6 16C27.6 17.5234 27.3 19.0318 26.717 20.4392C26.1341 21.8465 25.2796 23.1253 24.2025 24.2025C23.1253 25.2796 21.8465 26.1341 20.4392 26.717C19.0318 27.3 17.5234 27.6 16 27.6C14.4767 27.6 12.9683 27.3 11.5609 26.717C10.1535 26.1341 8.87475 25.2796 7.79759 24.2025C6.72043 23.1253 5.86598 21.8465 5.28302 20.4392C4.70007 19.0318 4.40002 17.5234 4.40002 16C4.40002 12.9235 5.62216 9.97301 7.79759 7.79759C9.97301 5.62216 12.9235 4.40002 16 4.40002C19.0765 4.40002 22.027 5.62216 24.2025 7.79759C26.3779 9.97301 27.6 12.9235 27.6 16Z' stroke='#2090FF' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round' />
                                            </svg>
                                            <h3 className='text-white font-medium text-sm mt-1'>Payment received!</h3>
                                            <p className='text-[#8e8e93] text-sm'>Thanks for the coffee ☕</p>
                                        </motion.div>
                                    )}

                                    {cardState === 'loading' && (
                                        <motion.div
                                            key='loading'
                                            initial={{ opacity: 0, filter: 'blur(4px)' }}
                                            animate={{ opacity: 1, filter: 'blur(0px)' }}
                                            exit={{ opacity: 0, filter: 'blur(4px)' }}
                                            transition={{ type: 'spring', duration: 0.1, bounce: 0 }}
                                            className='h-full flex flex-col items-center justify-center gap-3'
                                        >
                                            <Spinner size={20} color='rgba(255,255,255,0.65)' />
                                            <p className='text-[#8e8e93] text-sm'>Processing payment…</p>
                                        </motion.div>
                                    )}

                                    {cardState === 'idle' && (
                                        <motion.div
                                            key='idle'
                                            exit={{ y: 8, opacity: 0, filter: 'blur(4px)' }}
                                            transition={{ duration: 0.15, ease: 'easeOut' }}
                                            className='h-full flex flex-col'
                                        >
                                            <div className='flex flex-col items-center gap-5 px-6 pt-8 pb-6 flex-1'>
                                                <div className='bg-white rounded-2xl p-3'>
                                                    <Image
                                                        src='https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://buymeacoffee.com&bgcolor=ffffff&color=000000&margin=0'
                                                        alt='QR Code'
                                                        width={200}
                                                        height={200}
                                                        className='rounded-lg'
                                                        unoptimized
                                                    />
                                                </div>
                                                <div className='text-center space-y-2'>
                                                    <p className='text-white font-semibold text-lg leading-snug'>Scan to pay</p>
                                                    <p className='text-[#8e8e93] text-sm leading-relaxed tracking-tight'>
                                                        Open your payments app and scan this code to complete the payment.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className='border-t border-white/10' />

                                            <button
                                                onClick={handlePay}
                                                className='w-full py-1 text-white font-semibold text-base bg-[#2c2c2e] hover:bg-[#3a3a3c] transition-colors cursor-pointer flex items-center justify-center gap-2'
                                            >
                                                <motion.span layoutId=''>
                                                    <IconPaywall size={16} />
                                                </motion.span>
                                                <motion.span layoutId=''>Pay Now</motion.span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default BuyMeaCoffeeButton
