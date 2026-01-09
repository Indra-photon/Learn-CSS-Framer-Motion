'use client'

import React, { useState } from 'react'
import {AnimatePresence, motion} from 'motion/react'

interface ProductCardProps {
    title: string
    description: string
    features: string[]
    image: string
    price: string
}

const ProductCardData : ProductCardProps[]  = [
    {
        title: 'Premium Wireless Headphones',
        description: 'High-fidelity audio with active noise cancellation and premium comfort.',
        features: [
            '40-hour Battery Life',
            'Active Noise Cancellation',
            'Premium Sound Quality',
            'Comfortable Fit',
        ],
        image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
        price: '$299.99',
    },
    {
        title: 'Smart Fitness Watch',
        description: 'Track your health and stay connected with this advanced smartwatch.',
        features: [
            'Heart Rate Monitor',
            'Sleep Tracking',
            'GPS Navigation',
            'Water Resistant',
        ],
        image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg',
        price: '$199.99',
    },
    {
        title: 'Ultra-Slim Laptop',
        description: 'Powerful performance in a sleek, portable design for professionals.',
        features: [
            '16GB RAM',
            '512GB SSD',
            'Intel i7 Processor',
            '14-inch 4K Display',
        ],
        image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg',
        price: '$1299.99',
    },
    {
        title: 'Professional Camera Kit',
        description: 'Complete photography setup for professionals and enthusiasts.',
        features: [
            '24MP Full-Frame Sensor',
            '4K Video Recording',
            'Weather-Sealed Body',
            'Dual Card Slots',
        ],
        image: 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg',
        price: '$2499.99'
    }
]


function ProductCard() {
    const [isClicked, setIsClicked] = useState <ProductCardProps | null>(null)

  return (
    <div className='min-h-screen min-w-screen flex items-center justify-center bg-neutral-50 relative'>
        <div className='flex items-center justify-center gap-8 cursor-pointer relative'>

        <AnimatePresence>
            {isClicked && (
                <motion.div 
                    layoutId={`card-${isClicked.title}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{duration:0.3, type:'spring', stiffness:100, damping:20}}
                    className='fixed inset-0 m-auto w-[500px] h-[600px] bg-white/90 backdrop-blur-md rounded-xl border border-neutral-50 z-10'
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsClicked(null)
                    }}
                >
                    <div className='w-full h-full mx-auto'>
                        <img src={isClicked.image} alt={isClicked.title} className='w-full h-64 object-cover mb-4 p-1 rounded-xl'/>

                        <motion.div className='px-6' layoutId={`card-${isClicked.price}`}>
                            <h2 className='text-3xl font-bold mb-2 text-neutral-900'>{isClicked.title}</h2>
                            <div className='text-xl font-light text-neutral-900 mb-4'>{isClicked.price}</div>
                            <p className='text-neutral-900 mb-4'>{isClicked.description}</p>
                            <ul className='list-disc list-inside mb-6 text-neutral-900'>
                                {isClicked.features.map((feature, idx) => (
                                    <li key={idx}>{feature}</li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

            

            {ProductCardData.map((data,idx) => {
                return (
                    <motion.div key={idx} className='w-96 h-[420px] bg-white/10 backdrop-blur-md rounded-xl border border-neutral-50'
                        layoutId={`card-${data.title}`}
                        onClick={() => setIsClicked(data)}
                    >
                        <div className='relative h-full bg-white mask-b-from-80%'>
                            <img src={data.image} alt={data.title} className='w-full h-full object-cover mb-4 p-1 rounded-xl'/>

                            <motion.div className='px-4 absolute bottom-0 z-10' layoutId={`card-${data.price}`}>
                                <h2 className='text-4xl font-bold mb-2 text-black h-18'>{data.title}</h2>
                            </motion.div>
                        </div>
                    
                    </motion.div>


                )
            })
            }
        </div>

    </div>
  )
}

export default ProductCard