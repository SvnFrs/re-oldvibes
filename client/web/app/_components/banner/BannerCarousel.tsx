"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  description?: string;
  linkUrl?: string;
  displayOrder?: number;
}

interface BannerCarouselProps {
  className?: string;
}

export default function BannerCarousel({ className = "" }: BannerCarouselProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";
        const url = `${API}/banner/public`;
        console.log("Fetching banners from:", url);
        
        const res = await fetch(url, { 
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        const data = await res.json();
        console.log("Banner API Response:", { status: res.status, data });
        
        if (res.ok && Array.isArray(data.banners)) {
          console.log(`Found ${data.banners.length} banner(s)`);
          // Sort banners by displayOrder (ascending)
          const sortedBanners = [...data.banners].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          console.log("Sorted banners:", sortedBanners);
          setBanners(sortedBanners);
        } else {
          console.warn("No banners found or invalid response:", data);
          setBanners([]);
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (banners.length <= 1 || !isAutoPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000); // Change slide every 5 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [banners.length, isAutoPlaying]);

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < banners.length) {
      setCurrentIndex(index);
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 10000);
    }
  };

  // Don't render if loading or no banners
  if (loading) {
    return (
      <section className={`py-6 md:py-8 ${className}`}>
        <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg2 shadow-lg animate-pulse" />
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className={`py-6 md:py-8 ${className}`}>
      <div className="relative w-full">
        <div
          className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg2 shadow-lg"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Render all banners with fade transition */}
          {banners.map((banner, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? "opacity-100 z-0" : "opacity-0 z-[-1]"
                }`}
              >
                {banner.linkUrl ? (
                  <Link
                    href={banner.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                  >
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title}
                      fill
                      className="object-cover"
                      priority={isActive}
                      sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                        <h3 className="text-2xl md:text-3xl font-bold mb-2">{banner.title}</h3>
                        {banner.description && (
                          <p className="text-sm md:text-base text-white/90 line-clamp-2">
                            {banner.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <>
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title}
                      fill
                      className="object-cover"
                      priority={isActive}
                      sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                        <h3 className="text-2xl md:text-3xl font-bold mb-2">{banner.title}</h3>
                        {banner.description && (
                          <p className="text-sm md:text-base text-white/90 line-clamp-2">
                            {banner.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 md:p-3 transition-all z-10"
                aria-label="Previous banner"
                type="button"
              >
                <IconChevronLeft size={24} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 md:p-3 transition-all z-10"
                aria-label="Next banner"
                type="button"
              >
                <IconChevronRight size={24} />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-gruvbox-orange w-8"
                      : "bg-gruvbox-dark-bg3 hover:bg-gruvbox-dark-bg4"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  type="button"
                />
              ))}
            </div>
          )}

          {/* Slide Counter */}
          {banners.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
              {currentIndex + 1} / {banners.length}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

