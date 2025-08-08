'use client';

import Image from 'next/image';
import React from 'react';

const images = [
  { src: '/images/den/1.png', alt: 'Slide 1' },
  { src: '/images/den/2.png', alt: 'Slide 2' },
  { src: '/images/den/3.png', alt: 'Slide 3' },
  { src: '/images/den/4.png', alt: 'Slide 4' },
  { src: '/images/den/5.png', alt: 'Slide 5' },
];

export default function DenPage() {
  return (
    <div
      className='w-full h-screen overflow-y-scroll snap-y snap-mandatory'
      style={{ scrollSnapType: 'y mandatory', height: '100vh' }}
    >
      {images.map((img, idx) => (
        <section
          key={img.src}
          className='relative w-full h-screen snap-start flex items-center justify-center bg-gray-100'
          style={{ minHeight: '100vh' }}
        >
          <Image src={img.src} alt={img.alt} fill className='object-contain' priority={idx === 0} sizes='100vw' />
        </section>
      ))}
    </div>
  );
}
