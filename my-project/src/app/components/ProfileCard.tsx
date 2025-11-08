'use client'

import React, {useState} from 'react'
import Image from 'next/image'
import { IconStar, IconCoin, IconBriefcase, IconX, IconBrandGithub, IconBrandLinkedin, IconBrandTwitter } from '@tabler/icons-react';
import {AnimatePresence, motion} from 'framer-motion'
import Link from 'next/link';

interface Detail {
  label: string
  value: string
  Icon: React.ReactNode
}
interface Reviews {
  reviewer: string
  comment: string
  rating: number
  imgsrc?: string
}

interface SocialLink {
  Icon: React.ComponentType<{ className?: string; size?: number }>
  href: string
  label: string
}

const Details: Detail[] = [
  { label: 'Rating', value: '4.8/5', Icon: <IconStar size={24} className='text-white' /> },
  { label: 'Clients', value: '150+', Icon: <IconBriefcase size={24} className='text-white'/> },
  { label: 'Price', value: '$50/hr', Icon: <IconCoin size={24} className='text-white'/> },
]

const ReviewsData: Reviews[] = [
  { 
    reviewer: 'Alice', 
    comment: 'Great to work with! Indranil demonstrated excellent communication skills and delivered high-quality work consistently.', 
    rating: 5 
  },
  { 
    reviewer: 'Bob', 
    comment: 'Delivered on time and exceeded expectations. His attention to detail and problem-solving abilities are impressive.', 
    rating: 4.5 
  },
  { 
    reviewer: 'Charlie', 
    comment: 'Highly recommend! Outstanding technical expertise and professional approach. Made our complex project look easy.', 
    rating: 4.8 
  },
]

const SocialLinks: SocialLink[] = [
  { Icon: IconBrandGithub, href: 'https://github.com', label: 'GitHub' },
  { Icon: IconBrandLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { Icon: IconBrandTwitter, href: 'https://twitter.com', label: 'Twitter' }
]

const ContactForm = () => {
  return (
    <form className='flex flex-col gap-4 w-1/2 mt-4'>
      <input type='text' placeholder='Your Name' className='p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50'/>
      <input type='email' placeholder='Your Email' className='p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50'/>
      <textarea placeholder='Your Message' className='p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 h-32 resize-none'/>
      <motion.button type="button" className='w-full bg-white backdrop-blur-sm p-3 rounded-xl shadow-md text-black font-medium tracking-widest text-xl mt-2'>
        SEND MESSAGE
      </motion.button>
    </form>
  )
}

const getRandomPosition = () => {
  const positions = [
    { top: '10%', left: '10%' },
    { top: '15%', right: '15%' },
    { bottom: '10%', left: '15%' },
    { bottom: '15%', right: '10%' },
    { top: '30%', left: '5%' },
    { top: '50%', right: '5%' },
  ]
  return positions[Math.floor(Math.random() * positions.length)]
}

const ReviewCard = ({ review, onClose }: { review: Reviews, onClose: () => void }) => {
  const position = React.useMemo(() => getRandomPosition(), [])
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
      style={position}
      className='absolute w-72 p-4 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-lg shadow-2xl'
    >
      <button 
        onClick={onClose}
        className='absolute top-2 right-2 text-white/70 hover:text-white transition-colors'
      >
        <IconX size={20} />
      </button>
      <h3 className='text-2xl font-bold text-white mb-2'>{review.reviewer}</h3>
      <p className='text-white/80 mb-3'>{review.comment}</p>
      <div className='flex items-center gap-1'>
        <span className='text-yellow-400 text-lg font-semibold'>{review.rating}</span>
        <IconStar size={20} className='text-yellow-400 fill-yellow-400' />
      </div>
    </motion.div>
  )
}

const ProfileCard = () => {
  const [isContactFormVisible, setIsContactFormVisible] = useState(false)
  const [isReviewsVisible, setIsReviewsVisible] = useState(false)
  const [ishovered, setIsHovered] = useState<number | null>(null)

  return (
    <div className='relative'>

      <AnimatePresence>
        {isContactFormVisible && (
          <motion.div
            key='contact-form'
            initial={{ opacity: 0, y: -10, scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className='absolute w-full h-full flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 box-border z-50'
          >
            <ContactForm />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReviewsVisible && ReviewsData.map((review, idx) => (
          <ReviewCard 
            key={`review-${idx}`} 
            review={review} 
            onClose={() => setIsReviewsVisible(false)}
          />
        ))}
      </AnimatePresence>

    <motion.div 
    className='bg-black min-h-screen min-w-screen flex items-center justify-center'>
    <AnimatePresence>
      {!isContactFormVisible && (
        <motion.div
          key='profile-card'
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className='w-96 h-[500px] bg-white/10 border border-white/20 rounded-4xl shadow-2xl backdrop-blur-lg p-6 box-border'>
            <div className='flex flex-col'>
              <img
                src='/indranil.png'
                alt='Profile Picture'
                className='h-24 w-24 rounded-full border-4 border-white/20'
              />
              <h1 className='text-5xl tracking-wide font-bold bg-transparent bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400'>Indranil Maiti</h1>
              <div className='w-full flex justify-between items-center mb-8 mt-2'>
                <p className='text-2xl text-neutral-400 tracking-wider'>Web Developer</p>
                <motion.button onClick={() => setIsReviewsVisible(!isReviewsVisible)} className=' bg-white/10 backdrop-blur-sm rounded-xl shadow-md text-white font-medium tracking-widest text-xs px-2 py-1 cursor-pointer'>
                  REVIEWS
                </motion.button>
              </div>

              <div className='bg-white/10 rounded-xl w-full flex justify-between border border-neutral-200 p-2'>
                {Details.map((details, idx) => {
                  return (
                      <div key={idx} className='flex flex-col items-center justify-center p-1'>
                        {details.Icon}
                        <span className='text-xl text-neutral-300'>{details.label}</span>
                        <span className='text-md text-neutral-400'>{details.value}</span>
                      </div>
                  )
                })}
              </div>

              <div>
                <motion.button onClick={() => setIsContactFormVisible(!isContactFormVisible)} className='mt-6 w-full bg-white backdrop-blur-sm p-3 rounded-xl shadow-md text-black font-medium tracking-widest text-xl cursor-pointer'>
                  HIRE ME
                </motion.button>
              </div>

              <div className='flex justify-center gap-4 mt-6'>
                {SocialLinks.map((social, idx) => (
                  <Link
                    key={idx}
                    href={social.href} 
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className='p-3 rounded-full relative cursor-pointer'
                    onMouseEnter={() => setIsHovered(idx)}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    {ishovered === idx && (
                      <motion.div 
                        layoutId='social-hover'
                        className='absolute inset-0 rounded-full bg-black/80 border-2 border-white/20 z-0'
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <social.Icon className='text-white relative z-10' size={24} />
                  </Link>
                ))}
              </div>

            

            </div>

        </motion.div>
      )}
    </AnimatePresence>
    </motion.div>
    </div>
  )
}

export default ProfileCard