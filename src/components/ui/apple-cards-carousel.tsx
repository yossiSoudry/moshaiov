"use client";

import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface CarouselProps {
  items: React.ReactNode[];
  initialScroll?: number;
}

type Card = {
  src: string;
  title: string;
  category: string;
  description?: string;
  content?: React.ReactNode;
  href?: string;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      // In RTL, scrollLeft is 0 at start (right edge) and negative when scrolled
      // We use Math.abs and check against the total scrollable width
      const maxScroll = scrollWidth - clientWidth;
      const currentScroll = Math.abs(scrollLeft);

      // Can scroll to see previous items (scroll right in RTL = positive direction)
      setCanScrollPrev(currentScroll > 1);
      // Can scroll to see next items (scroll left in RTL = negative direction)
      setCanScrollNext(currentScroll < maxScroll - 1);
    }
  };

  // Scroll to see previous items (in RTL: items on the right)
  const scrollPrev = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  // Scroll to see next items (in RTL: items on the left)
  const scrollNext = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = isMobile() ? 260 : 320;
      const gap = isMobile() ? 16 : 24;
      const scrollPosition = -((cardWidth + gap) * index);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const isMobile = () => {
    return typeof window !== "undefined" && window.innerWidth < 768;
  };

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      {/* Outer container with max-width - clips overflow */}
      <div className="max-w-300 mx-auto px-4">
        {/* Carousel Window */}
        <div className="relative">
          {/* Scrollable Container */}
          <div
            className="flex overflow-x-scroll overscroll-x-auto py-6 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            ref={carouselRef}
            onScroll={checkScrollability}
            dir="rtl"
          >
            <div className="flex flex-row gap-4 md:gap-6 px-4">
              {items.map((item, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.5,
                      delay: 0.1 * index,
                      ease: "easeOut",
                    },
                  }}
                  key={"card" + index}
                  className="rounded-3xl shrink-0"
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Buttons - Below carousel */}
        <div className="flex justify-center gap-3 mt-8">
          {/* Prev button (scroll back - right in RTL) - Now on LEFT */}
          <button
            className={cn(
              "relative z-40 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-lg transition-all duration-300",
              "disabled:opacity-30 disabled:cursor-not-allowed",
              "hover:bg-white/20 hover:border-gold-500/40 hover:scale-105"
            )}
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="הקודם"
          >
            <ChevronRight className="h-5 w-5 text-gold-400" />
          </button>
          {/* Next button (scroll to see more items - left in RTL) - Now on RIGHT */}
          <button
            className={cn(
              "relative z-40 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-lg transition-all duration-300",
              "disabled:opacity-30 disabled:cursor-not-allowed",
              "hover:bg-white/20 hover:border-gold-500/40 hover:scale-105"
            )}
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="הבא"
          >
            <ChevronLeft className="h-5 w-5 text-gold-400" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({
  card,
  index,
  layout = false,
}: {
  card: Card;
  index: number;
  layout?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const handleOpen = () => {
    if (card.href) {
      window.location.href = card.href;
      return;
    }
    if (card.content) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  return (
    <>
      <AnimatePresence>
        {open && card.content && (
          <div className="fixed inset-0 h-screen z-50 overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-black/80 backdrop-blur-xl h-full w-full fixed inset-0"
              onClick={handleClose}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="max-w-5xl mx-auto bg-background rounded-3xl h-fit z-[60] my-10 p-4 md:p-10 relative"
            >
              <button
                className="sticky top-4 h-10 w-10 start-0 me-auto bg-foreground/10 rounded-full flex items-center justify-center hover:bg-foreground/20 transition-colors"
                onClick={handleClose}
              >
                <X className="h-5 w-5 text-foreground" />
              </button>
              <motion.p
                layoutId={layout ? `category-${card.title}` : undefined}
                className="text-sm font-medium text-gold-500 mb-2"
              >
                {card.category}
              </motion.p>
              <motion.h2
                layoutId={layout ? `title-${card.title}` : undefined}
                className="text-2xl md:text-4xl font-bold text-foreground mb-6"
              >
                {card.title}
              </motion.h2>
              <div className="py-6">{card.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.button
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        className={cn(
          "rounded-3xl bg-background overflow-hidden flex flex-col items-start justify-end relative z-10",
          "h-[400px] w-[280px] md:h-[500px] md:w-[380px]",
          "group cursor-pointer shadow-xl hover:shadow-2xl transition-shadow duration-300"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Image */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={card.src}
            alt={card.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 280px, 380px"
          />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/0 via-transparent to-gold-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Shimmer Effect - RTL aware */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 translate-x-full bg-linear-to-l from-transparent via-white/10 to-transparent group-hover:-translate-x-full transition-transform duration-1000" />
        </div>

        {/* Border Glow */}
        <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 group-hover:ring-gold-500/30 transition-all duration-500" />

        {/* Content */}
        <div className="relative z-10 p-6 md:p-8 w-full text-start">
          <motion.p
            layoutId={layout ? `category-${card.title}` : undefined}
            className="text-gold-400 text-sm font-medium mb-2"
          >
            {card.category}
          </motion.p>
          <motion.h3
            layoutId={layout ? `title-${card.title}` : undefined}
            className="text-white text-xl md:text-2xl font-bold mb-2"
          >
            {card.title}
          </motion.h3>
          {card.description && (
            <p className="text-white/70 text-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
              {card.description}
            </p>
          )}

          {/* CTA Arrow */}
          <div className="flex items-center gap-2 mt-4 text-gold-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-500">
            <span>גלו עוד</span>
            <motion.div
              animate={{ x: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.div>
          </div>
        </div>

        {/* Decorative Corner - RTL: top-start */}
        <div className="absolute top-4 start-4 w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 start-0 w-full h-px bg-gradient-to-e from-gold-400 to-transparent" />
          <div className="absolute top-0 start-0 h-full w-px bg-gradient-to-b from-gold-400 to-transparent" />
        </div>

        {/* Floating Sparkles */}
        <div className="absolute top-1/4 end-1/4 opacity-0 group-hover:opacity-100 transition-all duration-700">
          <motion.div
            animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            className="w-1 h-1 bg-gold-400 rounded-full"
          />
        </div>
        <div className="absolute top-1/3 start-1/3 opacity-0 group-hover:opacity-100 transition-all duration-700">
          <motion.div
            animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
            className="w-1.5 h-1.5 bg-gold-300 rounded-full"
          />
        </div>
      </motion.button>
    </>
  );
};

// Compact card variant for categories - With Shimmer & Parallax
export const CategoryCard = ({
  card,
  index,
}: {
  card: Card;
  index: number;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <motion.a
      ref={cardRef}
      href={card.href}
      className={cn(
        "rounded-3xl bg-neutral-900 overflow-hidden flex flex-col items-start justify-end relative z-10",
        "h-100 w-55 md:h-130 md:w-70",
        "group cursor-pointer"
      )}
      whileHover={{
        y: -10,
        boxShadow: "0 25px 50px -12px rgba(212, 175, 55, 0.25)",
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image with Parallax Effect */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        animate={{
          x: mousePosition.x * 15,
          y: mousePosition.y * 15,
          scale: 1.1,
        }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
      >
        <Image
          src={card.src}
          alt={card.title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 220px, 280px"
        />
      </motion.div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

      {/* Shimmer Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full bg-linear-to-l from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      </div>

      {/* Border Glow on Hover */}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 group-hover:ring-gold-500/40 transition-all duration-500" />

      {/* Content */}
      <div className="relative z-10 p-5 md:p-6 w-full text-start">
        <p className="text-gold-400 text-xs md:text-sm font-medium mb-1 uppercase tracking-wider">
          {card.category}
        </p>
        <h3 className="text-white text-lg md:text-xl font-bold leading-tight">
          {card.title}
        </h3>
      </div>
    </motion.a>
  );
};
