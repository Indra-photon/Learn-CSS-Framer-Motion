import React from 'react'

function Form() {
  return (
    <form className='h-full w-full px-8 py-14'>
        <h1 className='text-4xl font-bold tracking-tight bg-clip-text bg-gradient-to-b from-neutral-800 to-neutral-700'>
            This is a {" "}

            {/* <div className='relative inline-block'>
                <span className='relative z-20 text-white'>crazy</span>
                <span className='absolute inset-0 bg-red-500'></span>    
            </div> {" "} */}

            <span className='inline-block after:content-[] after:w-full after:h-full after:bg-red-400 after:-z-10 relative z-10 text-white after:absolute after:inset-0 after:-skew-3'>
                crazy
            </span>
            good form
        </h1>

        <div className='my-4 flex-col gap-8'>
            <div className='flex flex-col gap-2'>
                <label htmlFor='email' className='after:content-["*"] after:ml-0.5'>Email</label>
                <input name='email' type='email' placeholder='Email' className='focus:ring-2 focus:ring-neutral-300 focus:ring-offset-1 placeholder:text-white focus:bg-neutral-300 focus:border-none focus:outline-none border-transparent transition-all duration-200 rounded-lg px-4 py-2' />
            </div>
        </div>

    </form>
  )
}

export default Form

const Group = ({children, className}) => {
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {children}
        </div>
    )
}

const Label = ({children, className}) => {
    return (
        <label className={`after:content-["*"] after:ml-0.5 ${className}`}>
            {children}
        </label>
    )
}

const Input  = ({children, className}) => {
    return (
        <input className={`focus:ring-2 focus:ring-neutral-300 focus:ring-offset-1 placeholder:text-white focus:bg-neutral-300 focus:border-none focus:outline-none border-transparent transition-all duration-200 rounded-lg px-4 py-2 ${className}`}>
            {children}
        </input>
    )
}