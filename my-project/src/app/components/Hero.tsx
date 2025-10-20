export default function Hero() {
  return (
    <div className=" h-screen flex flex-col justify-center items-center">
       <h1 className="text-7xl tracking-tight max-w-2xl text-center leading-tight bg-clip-text text-transparent bg-linear-to-r from-pink-500 to-violet-500"> Unleash the Power of the Intuitive Finance</h1>
       <p className="text-neutral-500 text-center max-w-3xl mx-auto ">
        Say <span className="text-primary">goodbye</span> to outdated financila roles, every small business owner regardless of the background can now manage
        their own business like a pro
       </p>
       <div className="flex justify-center empty:white gap-4 w-full max-w-2xl">

         <input type="email" placeholder="Enter your email" className="px-4 py-2 my-5 rounded-2xl flex-1 border border-neutral-700 bg-transparent text-white outline-none focus:border-sky-600 transition-all duration-300"/>
         <button className="px-4 py-2 my-5 rounded-2xl cursor-pointer overflow-hidden border border-neutral-700 text-white relative">
          <div className="absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          Join Waitlist</button>
       </div>
    </div>
  )
}
