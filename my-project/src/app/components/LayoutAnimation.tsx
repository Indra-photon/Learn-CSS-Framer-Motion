"use client"

import { motion } from 'framer-motion'
import React, { useState } from 'react'



type card = {
    description: string,
    title: string,
    src: string,
    ctaText: string,
    ctaLink: string,
    content : () => React.ReactNode
}

const cards: card[] = [
    {
        title: 'Card 1',
        description: 'This is the description for Card 1.',
        src: '/images/card1.jpg',
        ctaText: 'Learn More',
        ctaLink: '#',
        content: () => <p>Additional content for Card 1.</p>
    },
    {
        title: 'Card 2',
        description: 'This is the description for Card 2.',
        src: '/images/card2.jpg',
        ctaText: 'Discover',
        ctaLink: '#',
        content: () => <p>Additional content for Card 2.</p>
    },
    {
        title: 'Card 3',
        description: 'This is the description for Card 3.',
        src: '/images/card3.jpg',
        ctaText: 'Get Started',
        ctaLink: '#',
        content: () => <p>Additional content for Card 3.</p>
    }
]

export default function LayoutAnimation () {
    const [current, setCurrent] = useState<card | null> (null)

    const useOutsideCallback = (callback: () => void) => {
        const ref = React.useRef<HTMLDivElement>(null);
        React.useEffect(() => {
            function handleClickOutside(event: MouseEvent) {
                if (ref.current && !ref.current.contains(event.target as Node)) {
                    callback();
                }
            }

            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [ref, callback]);
        return ref;
    };

    const ref = useOutsideCallback(() => setCurrent(null));
    return (
        <>
            <div className='py-10 bg-gray-100 min-h-screen min-w-2xl relative'>
                {current && (
                    <div className='fixed z-10 h-full inset-0 bg-black/50 backdrop-blur-sm'></div>
                )}

                { current && (
                    <motion.div layoutId={`card-${current.title}`} className='h-[600px] inset-0 z-20 fixed m-auto bg-white w-80 rounded-2xl border border-neutral-200 p-4'>
                        <img
                            src={current.src}
                            className='h-10 aspect-square rounded-xl'
                        />

                        <div ref={ref} className='flex justify-between items-center'>
                            <div className="flex flex-col items-start gap-2">
                                <div className='flex flex-col items-start justify-start gap-2'> 
                                    <h2 className='font-bold text-lg text-black'> {current.title} </h2>
                                    <p className='text-xs text-neutral-500'>{current.description}</p>
                                </div>

                                <div className='px-2 py-1 bg-green-500 rounded-xl flex items-center justify-center text-white text-xs'>
                                    {current.ctaText}
                                </div>
                            </div>

                            <div className='h-40 overflow-auto'>
                                {current.content()}
                            </div>

                        </div>
                    


                    </motion.div>
                )

                }


                <div className='max-w-2xl mx-auto flex flex-col gap-10'>
                    {cards.map( (card, idx) => 
                        <motion.button 
                        layoutId={`card-${card.title}`}
                        onClick={() => setCurrent(card)}
                        key={card.description} className='p-2 rounded-lg flex justify-between bg-white border border-neutral-200'>
                            <div className='flex items-center'>
                            <img src={card.src} className='h-10 aspect-square rounded-xl' />
                            </div>

                            <div className='flex flex-col items-start justify-start gap-2'> 
                                <h2 className='font-bold text-lg text-black'> {card.title} </h2>
                                <p className='text-xs text-neutral-500'>{card.description}</p>
                            </div>

                            <div className='px-2 py-1 bg-green-500 rounded-xl flex items-center justify-center text-white text-xs'>
                                {card.ctaText}
                            </div>

                        </motion.button>
                    )}
                </div> 

            </div>
        
        
        
        
        
        
        </>
    )
}