'use client';

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

function CartButton() {
    const [cartState, setCartState] = useState<'idle' | 'adding' | 'added'>('idle');


    const handleCartClick = () => {
        setCartState('adding');
        setTimeout(() => {
            setCartState('added');
            setTimeout(() => {
            // setCartState('idle');
            }, 1000); // Shows "Added" for 1 second
        }, 2000); // Shows "Adding..." for 2 seconds
    };
  return (
    <div>
        <motion.div className='flex flex-col items-center justify-center h-72 w-64 bg-black rounded-3xl shadow-lg'>
        <motion.div onClick={handleCartClick} className="relative overflow-hidden flex items-center justify-center gap-4 w-3/4 rounded-3xl cursor-pointer mt-2">
          <div className="absolute top-0 left-0 w-full h-full animate-gradient rounded-3xl z-0"
          style={{
            background: "linear-gradient(-45deg, #1a1a1a, #ffffff, #6b7280, #d1d5db, #1a1a1a)",
            backgroundSize: "400% 400%",
          }}></div>
          <motion.div className=" bg-neutral-800 rounded-3xl flex items-center justify-center gap-4 m-1 w-full relative z-10">

            <motion.span
              initial={{ x: 0 }}
              animate={{ 
                x: cartState === 'idle' ? 0 : (cartState === 'adding' ? 100 : 240) 
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="text-white h-8 w-8 relative"
            >
              {/* Cart icon - always visible */}
              <CartSvg cartState={cartState} />
            </motion.span>

            <AnimatePresence>
              {cartState === 'added' && (
                <motion.div
                  key="cart-icon-added"
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 10, opacity: 1 }}
                  exit={{ x: 40, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute left-5 h-8 w-8"
                >
                  <CartIconSvg />
                </motion.div>
              )}
            </AnimatePresence>



            <motion.span className="text-white text-xl h-10 tracking-tighter flex items-center justify-center w-40">
              <AnimatePresence mode="wait">
                { cartState === 'idle' && 
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-center"
                  >
                    <p className="text-md">Add to Cart</p>
                  </motion.span>
                }
                { cartState === 'added' && 
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-center"
                  >
                    <p className="text-md">Great Shopping!</p>
                  </motion.span>
                }
              </AnimatePresence>
            </motion.span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default CartButton


export const CartSvg: React.FC<{ cartState: 'idle' | 'adding' | 'added' }> = ({ cartState }) => {
    return (
        <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      className="w-full h-full"
    >
      {/* Cart Handle */}
      <path 
        d="M0 32 L96 32 C110 32 120 42 120 56 L140 140" 
        fill="none" 
        stroke="#ffffff" 
        strokeWidth="32" 
        strokeLinecap="round"
      />
      
      {/* Cart Body - Left Side (Pink) */}
      <path 
        d="M140 140 L480 140 L420 360 L160 360 Z" 
        fill="#ff5c7c"
      />
      
      {/* Cart Body - Right Side (Darker Red) */}
      <path 
        d="M310 140 L480 140 L420 360 L290 360 Z" 
        fill="#e94057"
      />
      
      {/* Cart Slots - Left */}
      <rect 
        x="230" 
        y="200" 
        width="30" 
        height="90" 
        rx="15" 
        fill="#e8f4f8"
      />
      
      {/* Cart Slots - Middle */}
      <rect 
        x="310" 
        y="200" 
        width="30" 
        height="90" 
        rx="15" 
        fill="#e8f4f8"
      />
      
      {/* Cart Slots - Right */}
      <rect 
        x="390" 
        y="200" 
        width="30" 
        height="90" 
        rx="15" 
        fill="#e8f4f8"
      />
      
      {/* Cart Base Bar */}
      <path 
        d="M130 380 C130 380 140 420 180 420 L420 420 C460 420 470 380 470 380" 
        fill="none" 
        stroke="#5d2e46" 
        strokeWidth="40" 
        strokeLinecap="round"
      />
      
      {/* Left Wheel - Outer */}
      <circle 
        cx="200" 
        cy="450" 
        r="40" 
        fill="#5d2e46"
      />
      
      {/* Left Wheel - Inner */}
      <circle 
        cx="200" 
        cy="450" 
        r="20" 
        fill="#e8f4f8"
      />
      
      {/* Right Wheel - Outer */}
      <circle 
        cx="410" 
        cy="450" 
        r="40" 
        fill="#5d2e46"
      />
      
      {/* Right Wheel - Inner */}
      <circle 
        cx="410" 
        cy="450" 
        r="20" 
        fill="#e8f4f8"
      />
    </svg>
    )
}


export const CartIconSvg: React.FC = () => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      className="w-full h-full"
    >
      {/* Cart Handle */}
      <path 
        d="M0 32 L96 32 C110 32 120 42 120 56 L140 140" 
        fill="none" 
        stroke="#ffffff" 
        strokeWidth="32" 
        strokeLinecap="round"
      />
      
      {/* Cart Body - Left Side (Pink) */}
      <path 
        d="M140 140 L480 140 L420 360 L160 360 Z" 
        fill="#ff5c7c"
      />
      
      {/* Cart Body - Right Side (Darker Red) */}
      <path 
        d="M310 140 L480 140 L420 360 L290 360 Z" 
        fill="#e94057"
      />
      
      {/* ANIMATED Yellow Box */}
      <motion.rect 
        x="160" 
        y="80" 
        width="140" 
        height="60" 
        rx="8" 
        fill="#ffd97d"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 80, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.1
        }}
      />
      
      {/* ANIMATED Green Gift Box - Left Side */}
      <motion.rect 
        x="310" 
        y="50" 
        width="80" 
        height="90" 
        rx="8" 
        fill="#7ed957"
        initial={{ y: -150, opacity: 0 }}
        animate={{ y: 50, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2
        }}
      />
      
      {/* ANIMATED Green Gift Box - Right Side */}
      <motion.rect 
        x="350" 
        y="50" 
        width="80" 
        height="90" 
        rx="8" 
        fill="#5fb946"
        initial={{ y: -150, opacity: 0 }}
        animate={{ y: 50, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2
        }}
      />
      
      {/* ANIMATED Gift Ribbon - Vertical */}
      <motion.rect 
        x="340" 
        y="50" 
        width="20" 
        height="90" 
        fill="#e94057"
        initial={{ y: -150, opacity: 0 }}
        animate={{ y: 50, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2
        }}
      />
      
      {/* ANIMATED Gift Bow - Left */}
      <motion.ellipse 
        cx="350" 
        cy="40" 
        rx="25" 
        ry="20" 
        fill="#ff5c7c"
        initial={{ cy: -60, opacity: 0 }}
        animate={{ cy: 40, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2
        }}
      />
      
      {/* ANIMATED Gift Bow - Right */}
      <motion.ellipse 
        cx="390" 
        cy="40" 
        rx="25" 
        ry="20" 
        fill="#e94057"
        initial={{ cy: -60, opacity: 0 }}
        animate={{ cy: 40, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2
        }}
      />
      
      {/* Cart Slots - Left */}
      <rect 
        x="230" 
        y="200" 
        width="30" 
        height="90" 
        rx="15" 
        fill="#e8f4f8"
      />
      
      {/* Cart Slots - Middle */}
      <rect 
        x="310" 
        y="200" 
        width="30" 
        height="90" 
        rx="15" 
        fill="#e8f4f8"
      />
      
      {/* Cart Slots - Right */}
      <rect 
        x="390" 
        y="200" 
        width="30" 
        height="90" 
        rx="15" 
        fill="#e8f4f8"
      />
      
      {/* Cart Base Bar */}
      <path 
        d="M130 380 C130 380 140 420 180 420 L420 420 C460 420 470 380 470 380" 
        fill="none" 
        stroke="#5d2e46" 
        strokeWidth="40" 
        strokeLinecap="round"
      />
      
      {/* Left Wheel - Outer */}
      <circle 
        cx="200" 
        cy="450" 
        r="40" 
        fill="#5d2e46"
      />
      
      {/* Left Wheel - Inner */}
      <circle 
        cx="200" 
        cy="450" 
        r="20" 
        fill="#e8f4f8"
      />
      
      {/* Right Wheel - Outer */}
      <circle 
        cx="410" 
        cy="450" 
        r="40" 
        fill="#5d2e46"
      />
      
      {/* Right Wheel - Inner */}
      <circle 
        cx="410" 
        cy="450" 
        r="20" 
        fill="#e8f4f8"
      />
    </svg>
  )
}