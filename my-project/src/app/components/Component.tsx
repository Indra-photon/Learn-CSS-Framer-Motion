import React from 'react'

// shadow-[4px_4px_0px_0px_var(--color-black)


function Component() {
  return (
    <div className='w-full rounded-2xl min-h-100 bg-neutral-100 
   bg-[radial-gradient(var(--color-neutral-200)_1px,transparent_1px)] bg-[length:10px_10px]
   p-8 flex items-center justify-center group/paaji flex-col'>

    <h2 className='text-4xl font-bold text-neutral-900 my-4 tracking-tight text-shadow-sm text-shadow-neutral-700'> 
         Stylish Card Component    
    </h2>

    <p className='max-w-lg mx-auto text-sm text-center mb-8  text-transparent bg-clip-text bg-gradient-to-br from-neutral-800 to-neutral-400'>
      A card component with intricate hover effects using Tailwind CSS. It demonstrates 3D transforms, layered radial backgrounds, smooth transitions, and responsive spacing — ideal for showcasing images or interactive content. Hover to reset the image rotation and reveal subtle color and border changes.
    </p>

    <div className='size-60 rounded-2xl border border-neutral-200 bg-neutral-100
    bg-[radial-gradient(var(--color-neutral-300)_1px,transparent_1px)] bg-[length:10px_10px]
    shadow-2xl relative perspective-distant'>
        <img src='https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1760' 
         className='h-full w-full object-cover
         transform rotate-x-30 -rotate-y-30 rotate-z-20 rounded-2xl
        transition-all duration-200
         group-hover/paaji:rotate-x-0 group-hover/paaji:rotate-y-0 group-hover/paaji:rotate-z-0
         group-hover/paaji:bg-neutral-200 group-hover/paaji:border-neutral-200'
        />

    </div>
        

    </div>
  )
}

export default Component