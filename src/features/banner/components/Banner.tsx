import Image from 'next/image'
import { cn } from '@/utils/tailwind'

interface BannerProps {
  src: string
  alt: string
}

export const Banner = ({ src, alt }: BannerProps) => {
  return (
    <div className={cn('relative my-6 aspect-[5/1] w-full overflow-hidden rounded-lg')}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
        priority
      />
    </div>
  )
}
