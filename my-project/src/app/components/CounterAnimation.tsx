// 'use client'

// import React, { useState } from 'react'
// import { motion } from 'framer-motion'

// function CounterAnimation() {
//   const [value, setValue] = useState(1)
//   const MAX_VALUE = 10
//   const MIN_VALUE = 1

//   // Grid column calculations
//   const minusColumns = value // 1 to 10
//   const numberColumns = 2 // fixed
//   const plusColumns = MAX_VALUE - value // 9 to 0

//   const handleIncrement = () => {
//     if (value < MAX_VALUE) {
//       setValue(value + 1)
//     }
//   }

//   const handleDecrement = () => {
//     if (value > MIN_VALUE) {
//       setValue(value - 1)
//     }
//   }

//   // Spring animation config
//   const spring = {
//     type: "spring" as const,
//     stiffness: 200,
//     damping: 18
//   }

//   return (
//     <div className="w-96 h-80 bg-stone-300 rounded-lg flex items-center justify-center p-4">
//       <div className="grid grid-cols-12 gap-2 h-15 w-full">
//         {/* Minus Button */}
//         {minusColumns > 0 && (
//           <motion.button
//             layout
//             transition={spring}
//             onClick={handleDecrement}
//             disabled={value === MIN_VALUE}
//             className={`
//               rounded-lg font-semibold text-2xl
//               flex items-center justify-center
//               border-2 transition-all duration-200
//               ${value === MIN_VALUE 
//                 ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed' 
//                 : 'bg-stone-200 text-stone-700 border-stone-300'
//               }
//             `}
//             style={{ gridColumn: `span ${minusColumns}` }}
//             whileHover={value !== MIN_VALUE ? { scale: 1.02 } : {}}
//             whileTap={value !== MIN_VALUE ? { scale: 0.98 } : {}}
//           >
//             <motion.span
//               layout
//               layoutId='minus-sign'
//               key={`minus-${value}`}
//               initial={{ opacity: 0, filter: "blur(4px)" }}
//               animate={{ opacity: 1, filter: "blur(0px)" }}
//               transition={spring}
//             >
//               −
//             </motion.span>
//           </motion.button>
//         )}

//         {/* Number Display */}
//         <motion.div
//           layout
//           transition={spring}
//           className="col-span-2 rounded-lg bg-stone-400 text-white font-bold text-2xl flex items-center justify-center border-2 border-stone-500"
//         >
//           <motion.span
//             key={value}
//             layout
//             layoutId='number-display'
//             initial={{ y: -20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={spring}
//           >
//             {value}
//           </motion.span>
//         </motion.div>

//         {/* Plus Button */}
//         {plusColumns > 0 && (
//           <motion.button
//             layout
//             transition={spring}
//             onClick={handleIncrement}
//             disabled={value === MAX_VALUE}
//             className={`
//               rounded-lg font-semibold text-2xl
//               flex items-center justify-center
//               border-2 transition-all duration-200
//               ${value === MAX_VALUE 
//                 ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed' 
//                 : 'bg-stone-200 text-stone-700 border-stone-300 '
//               }
//             `}
//             style={{ gridColumn: `span ${plusColumns}` }}
//             whileHover={value !== MAX_VALUE ? { scale: 1.02 } : {}}
//             whileTap={value !== MAX_VALUE ? { scale: 0.98 } : {}}
//           >
//             <motion.span
//               layout
//               key={`plus-${value}`}
//               layoutId='plus-sign'
//               initial={{ opacity: 0, filter: "blur(4px)" }}
//               animate={{ opacity: 1, filter: "blur(0px)" }}
//               transition={spring}
//             >
//               +
//             </motion.span>
//           </motion.button>
//         )}
//       </div>
//     </div>
//   )
// }

// export default CounterAnimation


'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

function CounterAnimation() {
  const [value, setValue] = useState(1)
  const MAX_VALUE = 10
  const MIN_VALUE = 1

  // Grid column calculations
  const minusColumns = value // 1 to 10
  const numberColumns = 2 // fixed
  const plusColumns = MAX_VALUE - value // 9 to 0

  const handleIncrement = () => {
    if (value < MAX_VALUE) {
      setValue(value + 1)
    }
  }

  const handleDecrement = () => {
    if (value > MIN_VALUE) {
      setValue(value - 1)
    }
  }

  // Spring animation config
  const spring = {
    type: "spring" as const,
    stiffness: 300,
    damping: 18
  }

  return (
    <div className="w-96 h-80 bg-stone-300 rounded-lg flex items-center justify-center p-4">
      <div className="grid grid-cols-12 gap-2 h-15 w-full">
        {/* Minus Button */}
        {minusColumns > 0 && (
          <motion.button
            layout
            transition={spring}
            onClick={handleDecrement}
            disabled={value === MIN_VALUE}
            className={`
              rounded-lg font-semibold text-2xl
              flex items-center justify-center
              border-2
              ${value === MIN_VALUE 
                ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed' 
                : 'bg-stone-200 text-stone-700 border-stone-300'
              }
            `}
            style={{ gridColumn: `span ${minusColumns}` }}
            whileTap={value !== MIN_VALUE ? { scale: 0.98 } : {}}
          >
            −
          </motion.button>
        )}

        {/* Number Display */}
        <motion.div
          layout
          transition={spring}
          className="col-span-2 rounded-lg bg-stone-200 text-stone-800 font-bold text-2xl flex items-center justify-center"
        >
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={spring}
          >
            {value}
          </motion.span>
        </motion.div>

        {/* Plus Button */}
        {plusColumns > 0 && (
          <motion.button
            layout
            transition={spring}
            onClick={handleIncrement}
            disabled={value === MAX_VALUE}
            className={`
              rounded-lg font-semibold text-2xl
              flex items-center justify-center
              border-2
              ${value === MAX_VALUE 
                ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed' 
                : 'bg-stone-200 text-stone-700 border-stone-300'
              }
            `}
            style={{ gridColumn: `span ${plusColumns}` }}
            whileTap={value !== MAX_VALUE ? { scale: 0.98 } : {}}
          >
            +
          </motion.button>
        )}
      </div>
    </div>
  )
}

export default CounterAnimation