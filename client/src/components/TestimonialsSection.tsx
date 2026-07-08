"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow, Navigation, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface TestimonialCardProps {
  avatar: string;
  name: string;
  role: string;
  quote: string;
}

export function TestimonialCard({ avatar, name, role, quote }: TestimonialCardProps) {
  return (
    <div className="bg-brand-white border border-slate-200/50 p-8 rounded-clay-lg flex flex-col justify-between h-full shadow-[0_8px_30px_rgba(0,0,0,0.04)] select-none text-left">
      <div className="flex-1 flex flex-col justify-center">
        <span className="text-4xl text-brand-cyan/25 font-serif leading-none select-none">“</span>
        <p className="text-sm text-body leading-relaxed -mt-2 font-normal">
          {quote}
        </p>
        <span className="text-4xl text-brand-cyan/25 font-serif leading-none select-none text-right">”</span>
      </div>
      <div className="flex items-center gap-3 pt-4 border-t border-slate-100 shrink-0">
        <div className="relative h-11 w-11 rounded-full overflow-hidden border border-slate-200/40 shadow-sm bg-white shrink-0">
          <Image
            src={avatar}
            alt={name}
            fill
            sizes="44px"
            className="object-cover scale-110"
          />
        </div>
        <div>
          <h4 className="text-sm font-bold text-ink leading-tight">{name}</h4>
          <span className="text-[11px] text-muted-text font-medium leading-none mt-1 inline-block">{role}</span>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const reviews: TestimonialCardProps[] = [
    {
      avatar: "/images/jethiya-logo2.png",
      name: "Jethalal Gada",
      role: "Gada Electronics, Proprietor",
      quote: "Babita ji suggested this app to me, and now I randomize episodes every night after sorting Gada Electronics ledger sheets! Tapli to Sundar for not building this sooner.",
    },
    {
      avatar: "/images/tarak-mehta.jpg",
      name: "Taarak Mehta",
      role: "Fire Brigade & Writer",
      quote: "Whenever Anjali serves me diet food or bitter gourd soup, I watch a classic episode here to forget my hunger. A true nostalgic lifesaver!",
    },
    {
      avatar: "/images/Aatmaram Bhide.webp",
      name: "Aatmaram Bhide",
      role: "Gokuldham Society, Secretary",
      quote: "I track society maintenance checks, and now I can track my watched episode history! 100% disciplined, modern tech that Tapu Sena approved.",
    },
  ];

  const cssStyles = `
    .TestimonialsSwiper {
      width: 100%;
      padding-top: 10px;
      padding-bottom: 50px !important;
    }
    
    .TestimonialsSwiper .swiper-slide {
      width: 330px;
      height: 320px;
      opacity: 0.55;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .TestimonialsSwiper .swiper-slide-active {
      opacity: 1;
    }

    .swiper-pagination-bullet-active {
      background-color: #00acc0 !important;
      width: 20px !important;
      border-radius: 4px !important;
    }
  `;

  return (
    <section className="w-full py-16 md:py-24 px-6 sm:px-8 max-w-7xl mx-auto flex flex-col space-y-12 relative">
      <style>{cssStyles}</style>

      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-cyan">
          TESTIMONIALS
        </span>
        <h2 className="font-display text-3xl md:text-5xl text-ink font-semibold tracking-[-0.02em] mt-3">
          Loved by Gokuldham Residents
        </h2>
        <p className="text-sm text-muted-text mt-2 font-normal">
          Hear what the prominent members of Gokuldham Co-operative Housing Society say about our platform.
        </p>
      </div>

      {/* Slider Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-5xl mx-auto px-10"
      >
        <Swiper
          spaceBetween={16}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          effect="coverflow"
          grabCursor={true}
          slidesPerView="auto"
          centeredSlides={true}
          loop={true}
          coverflowEffect={{
            rotate: 15,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom",
          }}
          modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
          className="TestimonialsSwiper"
        >
          {[...reviews, ...reviews, ...reviews].map((review, idx) => (
            <SwiperSlide key={idx}>
              <TestimonialCard {...review} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Controls */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 z-10 flex justify-between pointer-events-none px-2 sm:px-4">
          <button className="swiper-button-prev-custom pointer-events-auto h-10 w-10 rounded-full bg-brand-white border border-slate-200/50 shadow-md flex items-center justify-center text-ink hover:text-brand-cyan hover:scale-105 active:scale-95 transition-all cursor-pointer">
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button className="swiper-button-next-custom pointer-events-auto h-10 w-10 rounded-full bg-brand-white border border-slate-200/50 shadow-md flex items-center justify-center text-ink hover:text-brand-cyan hover:scale-105 active:scale-95 transition-all cursor-pointer">
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
