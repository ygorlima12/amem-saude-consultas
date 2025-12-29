import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CarouselCard {
  title: string
  description: string
  onClick?: () => void
}

interface CarouselProps {
  title?: string
  cards: CarouselCard[]
}

const gradients = [
  'linear-gradient(135deg, #183157 0%, #0DB5A6 100%)', // Primary
  'linear-gradient(135deg, #dc3545 0%, #c82333 100%)', // Danger
  'linear-gradient(135deg, #28a745 0%, #218838 100%)', // Success
  'linear-gradient(135deg, #17a2b8 0%, #138496 100%)', // Info
  'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)', // Warning
]

export const Carousel = ({ title, cards }: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1))
  }

  useEffect(() => {
    if (trackRef.current) {
      const cardWidth = 320 // min-width
      const gap = 20
      const offset = currentIndex * (cardWidth + gap)
      trackRef.current.style.transform = `translateX(-${offset}px)`
    }
  }, [currentIndex])

  return (
    <div className="mb-10">
      {title && (
        <h2 className="text-2xl font-bold text-secondary-900 mb-5">{title}</h2>
      )}
      
      <div className="relative overflow-hidden">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white hover:shadow-button transition-all duration-300 flex items-center justify-center text-secondary-900"
        >
          <ChevronLeft size={24} />
        </button>
        
        <button
          onClick={handleNext}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white hover:shadow-button transition-all duration-300 flex items-center justify-center text-secondary-900"
        >
          <ChevronRight size={24} />
        </button>

        {/* Carousel Track */}
        <div
          ref={trackRef}
          className="flex gap-5 transition-transform duration-[450ms] ease-in-out"
          style={{ willChange: 'transform' }}
        >
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={card.onClick}
              className={cn(
                'min-w-[320px] h-[280px] rounded-xl overflow-hidden relative transition-transform duration-300 shadow-card flex-shrink-0',
                card.onClick && 'cursor-pointer hover:scale-105 hover:shadow-modal'
              )}
            >
              {/* Background Gradient */}
              <div
                className="absolute w-full h-full"
                style={{ background: gradients[index % gradients.length] }}
              />
              
              {/* Content */}
              <div className="relative z-[2] p-[30px] h-full flex flex-col justify-between text-white">
                <div>
                  <h3 className="text-[22px] font-bold mb-2.5">{card.title}</h3>
                  <p className="text-sm leading-[1.5] opacity-95">{card.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
