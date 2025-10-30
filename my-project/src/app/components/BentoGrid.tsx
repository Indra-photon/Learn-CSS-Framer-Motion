import React from 'react'
import Image from 'next/image'
import Link from 'next/link'


function BentoGrid() {
  return (
    <div className='h-screen w-full mx-auto pt-20 pb-10 max-w-5xl'>
        <Header />
        <div className='grid grid-cols-4 gap-4 mask-b-from-50%'>
            <Column>
                <Card src="/images/1.png" alt="Image 1" href='/images/1.png' className=""/>
                <Card src="/images/2.png" alt="Image 2" href='/images/2.png' className=""/>
                <Card src="/images/3.jpeg" alt="Image 3" href='/images/3.jpeg' className=""/>
            </Column>
            <Column>
                <Card src="/images/4.JPG" alt="Image 4" href='/images/4.JPG' className=""/>
                <Card src="/images/5.png" alt="Image 5" href='/images/5.png' className=""/>
                <Card src="/images/6.png" alt="Image 6" href='/images/6.png' className=""/>
            </Column>
            <Column>
                <Card src="/images/4.JPG" alt="Image 4" href='/images/4.JPG' className=""/>
                <Card src="/images/5.png" alt="Image 5" href='/images/5.png' className=""/>
                <Card src="/images/6.png" alt="Image 6" href='/images/6.png' className=""/>
            </Column>
            <Column>
                <Card src="/images/1.png" alt="Image 1" href='/images/1.png' className=""/>
                <Card src="/images/2.png" alt="Image 2" href='/images/2.png' className=""/>
                <Card src="/images/3.jpeg" alt="Image 3" href='/images/3.jpeg' className=""/>
            </Column>

        </div>
    </div>
  )
}

export default BentoGrid


const Column = ({children}: {children: React.ReactNode}) => (
    <div className=''>
        {children}
    </div>
)

const Card = ({src, alt, href, className}: {src: string, alt: string, href: string, className?: string}) => {
    return (
        <Link href={href} className='group'>
            <div className='relative rounded-md my-2 overflow-hidden shadow-sm after:content[""] after:absolute after:bg-black after:opacity-0 after:w-full after:h-full after:inset-0 hover:after:opacity-50 after:transition-all after:duration-300 '>
                <Image src={src} alt={alt} height={500} width={500} className={className}/>
                <p className='absolute inset-0 text-white font-medium text-sm flex items-center justify-center z-20
                opacity-0 group-hover:opacity-100 transition-opacity duration-300
                '>{href}</p>
            </div>
        </Link>
    )
}

const Header = () => (
  <div>
    <h1 className="text-3xl font-bold tracking-tighter text-neutral-700">BentoGrid are Cool, You should try it sometime</h1>
        <p className='text-base text-neutral-500 max-w-xl mt-4'>This is a simple BentoGrid component.</p>
  </div>
)