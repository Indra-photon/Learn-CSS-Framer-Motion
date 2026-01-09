'use client'

import React, {useEffect, useState} from 'react'
import { AnimatePresence, motion } from 'motion/react';
import { Phone, MessageCircle, Heart } from "lucide-react";
import { X } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  image: string;
  header: string;
  role?: string;
}

const profiles: Profile[] = [
  {
    id: "julia_toth",
    name: "Julia Toth",
    image: "https://100dayscss.com/codepen/13-1.jpg",
    header: "https://100dayscss.com/codepen/13-1-header.jpg",
    role: "Web Developer"
  },
  {
    id: "david_james",
    name: "David James",
    image: "https://100dayscss.com/codepen/13-2.jpg",
    header: "https://100dayscss.com/codepen/13-1-header.jpg",
    role: "UI/UX Designer"
  },
  {
    id: "anne_chong",
    name: "Anne Chong",
    image: "https://100dayscss.com/codepen/13-3.jpg",
    header: "https://100dayscss.com/codepen/13-1-header.jpg",
    role: "Project Manager"
  },
  {
    id: "harley_quinn",
    name: "Harley Quinn",
    image: "https://100dayscss.com/codepen/13-4.jpg",
    header: "https://100dayscss.com/codepen/13-1-header.jpg",
    role: "Marketing Specialist"
  },
]

// export default function ImageGrid() {
//   const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 p-4">
//       <div className="relative w-[400px] h-[400px] rounded-sm shadow-[4px_8px_16px_0_rgba(0,0,0,0.1)] overflow-hidden bg-white font-sans">

      // <div
      //   className={`absolute inset-[1%] grid grid-cols-2 grid-rows-2 items-center justify-items-center transition-all ${
      //     selectedProfile ? "z-0 duration-500" : "z-[2] duration-[1s] delay-[0.8s]"
      //   }`}
      // > 
      //   {profiles.map((profile) => (
      //     <button
      //       key={profile.id}
      //       onClick={() => setSelectedProfile(profile.id)}
      //       className="relative group cursor-pointer"
      //     >
            
      //       <div className="absolute w-[50px] h-[50px] rounded-full bg-[#ed6666] z-[1] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[2] opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100">
      //         <p className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 text-white text-[30px] leading-none">
      //           +
      //         </p>
      //       </div>
            
          
      //       <img
      //         src={profile.image || "/placeholder.svg"}
      //         alt={profile.name}
      //         className="transition-all duration-[1s] group-hover:brightness-60"
      //       />
      //     </button>
      //   ))}
      // </div>

//             <div className='relative group overflow-hidden w-1/2'>
//                 <div className="absolute w-[50px] h-[50px] rounded-full bg-[#ed6666] z-[1] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-150 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100">
//                     <div className='absolute left-1/2 top-[45%] text-white -translate-x-1/2 -translate-y-1/2 delay-75'>
//                         +
//                     </div>
                    

//                 </div>
//                 <img src={profiles[0].image} alt={profiles[0].name} className="transition-all duration-[1s] hover:brightness-60 cursor-pointer" onClick={() => setSelectedProfile(profiles[0].id)} />
//             </div>



//              {/* {profiles.map((profile) => {
//                 const isSelected = selectedProfile === profile.id
//                 return (
//                 <div key={profile.id} className="absolute inset-0 pointer-events-none">             
//                     <div className="w-full h-[45%] absolute pointer-events-auto">
//                       <img
//                         src={profile.header || "/placeholder.svg"}
//                         alt="Header"
//                         className={`absolute w-full h-full object-cover transition-all duration-700 ${
//                         isSelected ? "top-0 ease-in-out delay-100" : "-top-[200px] ease-in-out delay-500"
//                         }`}
//                       />
                    
//                     <div
//                         className={`absolute w-[100px] h-[100px] rounded-full bg-cover border-2 border-white left-1/2 -translate-x-1/2 transition-all duration-[1s] ${
//                         isSelected ? "top-[180px] ease-in-out delay-300" : "-top-[100px] ease-in-out delay-200"
//                         }`}
//                         style={{ backgroundImage: `url(${profile.image})` }}
//                     />
                    
//                     <button
//                         onClick={() => setSelectedProfile(null)}
//                         className={`w-[50px] h-[50px] rounded-full bg-[#ed6666] absolute right-0 m-3 cursor-pointer z-[1] transition-all duration-[1.5s] hover:bg-white group ${
//                         isSelected ? "top-0 ease-in-out delay-[0.6s]" : "-top-[200px] ease-in-out"
//                         }`}
//                     >
//                         <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 text-white text-[30px] leading-none transition-colors duration-[1s] group-hover:text-[#ed6666]">
//                         +
//                         </p>
//                     </button>
//                     </div>

                    
//                     <div
//                     className={`w-full h-[55%] bg-[#ed6666] absolute transition-all duration-700 ${
//                         isSelected ? "top-[45%] ease-in-out delay-100" : "top-full ease-in-out delay-500"
//                     }`}
//                     >
                    
//                     <div className="absolute text-white font-semibold left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2">
//                         {profile.name}
//                     </div>
                    
                    // <div className="absolute left-[7%] top-[45%] flex gap-5">
                    //     <button className="w-[45px] h-[45px] rounded-full bg-[#ed6666] text-white border border-white cursor-pointer transition-all duration-500 hover:bg-white hover:text-[#ed6666] flex items-center justify-center">
                    //     <Phone className="w-5 h-5" />
                    //     </button>
                    //     <button className="w-[45px] h-[45px] rounded-full bg-[#ed6666] text-white border border-white cursor-pointer transition-all duration-500 hover:bg-white hover:text-[#ed6666] flex items-center justify-center">
                    //     <MessageCircle className="w-5 h-5" />
                    //     </button>
                    //     <button className="w-[45px] h-[45px] rounded-full bg-[#ed6666] text-white border border-white cursor-pointer transition-all duration-500 hover:bg-white hover:text-[#ed6666] flex items-center justify-center">
                    //     <Heart className="w-5 h-5" />
                    //     </button>
                    // </div>
//                     </div>
//                 </div>
//                 )
//               })} */}
        

//       </div>

//       {/*  */}
//     </div>
//   );
// }


export default function ImageGrid() {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)

  return (
    <div className='bg-neutral-200 rounded-3xl border border-neutral-300 mx-24 h-4/5 w-4/5'>
      <div className='flex h-full justify-between px-10 items-center'>
        <div className='p-3'>
          <p className='text-9xl pb-8 font-bold text-neutral-400'>Meet <br/> Our <span className='text-neutral-800'>Team</span></p>
          <p className='text-4xl w-3/4 text-neutral-600'> Meet the people who crafts the digital experience for you</p>
        </div>

        <div className={`grid grid-cols-2 grid-rows-2 items-center justify-center gap-5 transition-all ${selectedProfile ? "z-0 duration-500" : "z-[2] duration-[1s] delay-[0.8s]"}`}> 
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => setSelectedProfile(profile)}
              className="relative overflow-hidden group cursor-pointer"
            >
              
              <div className="absolute w-[50px] h-[50px] rounded-full bg-[#ed6666] z-[1] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[2] opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100">
                <p className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 text-white text-[30px] leading-none">
                  +
                </p>
              </div>
              
            
              <img
                src={profile.image || "/placeholder.svg"}
                alt={profile.name}
                className="transition-all duration-[1s] w-80 rounded-2xl group-hover:brightness-60"
              />

              <AnimatePresence mode='wait'>
                {selectedProfile?.id === profile.id && (
                  <>
                  <motion.div 
                    key={`header-${profile.id}`}
                    initial={{ opacity: 0, y: -100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -100 }}
                    transition={{ ease: "easeOut", duration: 0.5 }}
                    style={{ backgroundImage: `url(${selectedProfile.header})` }}
                    className={`absolute inset-0 pointer-events-none h-1/2 top-0 flex items-center justify-center z-[5]`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <h2 className="text-2xl text-neutral-800">{selectedProfile.name}</h2>
                      <p className="text-lg text-neutral-600">{selectedProfile.role}</p>
                    </div>

                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ ease: "easeIn", duration: 0.2, delay: 0.2 }}
                      className='absolute bg-[#eb7777]/70 pointer-events-auto w-8 h-8 rounded-full top-2 right-2 rotate-45 flex items-center justify-center cursor-pointer transition-all duration-500 hover:bg-[#eb7777]' 
                      onClick={(e) => {e.stopPropagation(); setSelectedProfile(null)}}
                    >
                      <X className="w-4 h-4 rotate-45 text-white" />
                    </motion.span>
                  </motion.div>

                  <motion.div 
                    key={`body-${profile.id}`}
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    transition={{ ease: "easeOut", duration: 0.5 }}
                    className={`absolute inset-0 pointer-events-none h-1/2 top-1/2 bg-[#ed6666] flex items-center justify-center z-[5]`}
                  >
                    <div className="flex items-center justify-center gap-5">
                        <span className="w-[45px] h-[45px] rounded-full bg-[#ed6666] text-white border border-white cursor-pointer transition-all duration-500 hover:bg-white hover:text-[#ed6666] flex items-center justify-center">
                        <Phone className="w-5 h-5" />
                        </span>
                        <span className="w-[45px] h-[45px] rounded-full bg-[#ed6666] text-white border border-white cursor-pointer transition-all duration-500 hover:bg-white hover:text-[#ed6666] flex items-center justify-center">
                        <MessageCircle className="w-5 h-5" />
                        </span>
                        <span className="w-[45px] h-[45px] rounded-full bg-[#ed6666] text-white border border-white cursor-pointer transition-all duration-500 hover:bg-white hover:text-[#ed6666] flex items-center justify-center">
                        <Heart className="w-5 h-5" />
                        </span>
                    </div>
                  </motion.div>
                  </>
                )}
              </AnimatePresence>
            </button>
          ))}

          {/* <AnimatePresence mode='wait'>
            
            {selectedProfile && 
              profiles.map((profile) => {
                const isSelected = selectedProfile === profile.id
                console.log(`isSelected for ${profile.id}: ${isSelected}`);
                
                return isSelected ? (
                  <div key={profile.id} className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-black opacity-50" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white">
                      <h2 className="text-2xl font-bold">{profile.name}</h2>
                      <p className="text-sm">{profile.id}</p>
                    </div>
                  </div>
                ) : null
              })}
          </AnimatePresence> */}
        </div>
      </div>
    </div>
  )
}

