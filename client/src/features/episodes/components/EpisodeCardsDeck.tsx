"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Autoplay as SwiperAutoplay, EffectCards, Navigation as SwiperNavigation, Pagination as SwiperPagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Episode } from "./EpisodeGrid";
import { Button } from "@/components/ui/button";
import { FavButton } from "@/components/ui/fav-button";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

import "swiper/css/effect-cards";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css";
import styles from "./EpisodeCardsDeck.module.css";

interface EpisodeCardsDeckProps {
  episodes: Episode[];
  onSelectEpisode: (episode: Episode) => void;
  favoritedIds: Set<string>;
  onToggleFavorite: (episode: Episode, isFav: boolean) => void;
}

export function EpisodeCardsDeck({
  episodes,
  onSelectEpisode,
  favoritedIds,
  onToggleFavorite,
}: EpisodeCardsDeckProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    // Set initial index
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className={`w-full relative ${styles.deck}`}>

      {/* 1. Mobile Screen: Swiper Stack (Tactile 3D Card deck) */}
      <div className="flex md:hidden flex-col items-center justify-center py-4 w-full">
        <Swiper
          effect="cards"
          grabCursor={true}
          loop={episodes.length > 1}
          className="h-[290px] w-[260px] drop-shadow-xl"
          modules={[EffectCards, SwiperAutoplay, SwiperPagination, SwiperNavigation]}
        >
          {episodes.map((episode) => {
            const isFav = favoritedIds.has(episode.id);
            return (
              <SwiperSlide
                key={episode.id}
                className="rounded-3xl overflow-hidden border border-slate-200/60 bg-surface-card select-none flex flex-col"
              >
                <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-800 relative">
                  <img
                    className="h-full w-full object-cover select-none pointer-events-none"
                    src={episode.thumbnailUrl || `https://img.youtube.com/vi/${episode.youtubeVideoId}/0.jpg`}
                    alt={episode.title}
                  />
                  <FavButton
                    isFav={isFav}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(episode, isFav);
                    }}
                    size="sm"
                    className="absolute top-2.5 right-2.5"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between gap-3 text-left">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {episode.genre}
                    </span>
                    <h3 className="mt-1 text-xs font-bold text-ink line-clamp-2 leading-snug tracking-tight">
                      {episode.title}
                    </h3>
                  </div>
                  <Button
                    variant="cyan"
                    size="sm"
                    className="w-full font-bold text-xs shadow-clay-cyan py-2 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform duration-100 mt-auto"
                    onClick={() => onSelectEpisode(episode)}
                  >
                    <Play className="h-3 w-3 fill-white text-white" />
                    Watch Now
                  </Button>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
        {/* Mobile Swipe Hint for Card Deck */}
        {episodes.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-5 text-[10px] font-bold text-muted-text/75 tracking-wider uppercase select-none animate-pulse">
            <svg className="h-3.5 w-3.5 text-brand-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16l-4-4m0 0l4-4m-4 4h18m-4 4l4-4m-4-4l4 4" />
            </svg>
            <span>Swipe card left/right for next</span>
          </div>
        )}
      </div>

      {/* 2. Desktop Screen: Embla Carousel with Framer Motion clipPath */}
      <div className="hidden md:flex flex-col items-center justify-center w-full py-2">
        <Carousel
          setApi={setApi}
          className="w-full max-w-5xl"
          opts={{
            loop: false,
            align: "center",
            containScroll: false,
          }}
        >
          <CarouselContent className="flex h-[360px] w-full items-center">
            {episodes.map((episode, index) => {
              const isFav = favoritedIds.has(episode.id);
              const isActive = current === index;

              return (
                <CarouselItem
                  key={episode.id}
                  className="relative flex h-[90%] w-full basis-[75%] sm:basis-[50%] md:basis-[40%] lg:basis-[33%] xl:basis-[28%] items-center justify-center px-3"
                >
                  <motion.div
                    initial={false}
                    animate={{
                      clipPath: !isActive
                        ? "inset(12% 0 12% 0 round 2rem)"
                        : "inset(0 0 0 0 round 2rem)",
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="h-full w-full overflow-hidden rounded-[2rem] bg-zinc-950 border border-slate-200/20 relative shadow-md"
                  >
                    {/* Cover image */}
                    <img
                      src={episode.thumbnailUrl || `https://img.youtube.com/vi/${episode.youtubeVideoId}/0.jpg`}
                      alt={episode.title}
                      className="h-full w-full object-cover scale-105"
                    />

                    {/* Dark gradient mask */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                    {/* Active State Controls */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 flex flex-col justify-between p-5 pointer-events-auto z-10"
                        >
                          {/* Top Badges */}
                          <div className="flex items-center justify-between">
                            <span className="bg-brand-cyan/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-bold text-brand-cyan border border-brand-cyan/35 tracking-wider uppercase">
                              {episode.genre}
                            </span>
                            <FavButton
                              isFav={isFav}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(episode, isFav);
                              }}
                              size="md"
                            />
                          </div>

                          {/* Bottom Details & Button */}
                          <div className="flex flex-col gap-3">
                            <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug tracking-tight">
                              {episode.title}
                            </h3>
                            <Button
                              variant="cyan"
                              size="sm"
                              className="w-full font-bold text-xs shadow-clay-cyan py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                              onClick={() => onSelectEpisode(episode)}
                            >
                              <Play className="h-3 w-3 fill-white text-white" />
                              Watch Episode
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* Left Arrow Button */}
          {episodes.length > 1 && (
            <button
              aria-label="Previous slide"
              onClick={() => api?.scrollPrev()}
              className="absolute left-2 md:left-4 lg:-left-14 top-1/2 -translate-y-1/2 z-20 rounded-full bg-brand-white/95 hover:bg-brand-white border border-slate-200/80 p-3 cursor-pointer transition-all shadow-md active:scale-95 hover:scale-105"
            >
              <ChevronLeft className="h-5 w-5 text-slate-700" />
            </button>
          )}

          {/* Right Arrow Button */}
          {episodes.length > 1 && (
            <button
              aria-label="Next slide"
              onClick={() => api?.scrollNext()}
              className="absolute right-2 md:right-4 lg:-right-14 top-1/2 -translate-y-1/2 z-20 rounded-full bg-brand-white/95 hover:bg-brand-white border border-slate-200/80 p-3 cursor-pointer transition-all shadow-md active:scale-95 hover:scale-105"
            >
              <ChevronRight className="h-5 w-5 text-slate-700" />
            </button>
          )}

          {/* Dot Indicators */}
          {episodes.length > 1 && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {episodes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                    "h-2 w-2 cursor-pointer rounded-full transition-all duration-300",
                    current === index ? "bg-brand-cyan w-6" : "bg-[#D9D9D9] hover:bg-slate-400",
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </Carousel>
      </div>
    </div>
  );
}
