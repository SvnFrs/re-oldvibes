"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getVibeById } from "../../_apis/common/vibes";

interface VibeInfoCardProps {
  vibeId: string;
  className?: string;
}

export default function VibeInfoCard({ vibeId, className = "" }: VibeInfoCardProps) {
  const [vibe, setVibe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVibe = async () => {
      try {
        setLoading(true);
        const response = await getVibeById(vibeId);
        setVibe(response.vibe);
      } catch (error) {
        console.error("Failed to fetch vibe:", error);
      } finally {
        setLoading(false);
      }
    };

    if (vibeId) {
      fetchVibe();
    }
  }, [vibeId]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gruvbox-gray/20 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-gruvbox-gray/20 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gruvbox-gray/20 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!vibe) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Link href={`/vibes/${vibe.id}`} className={`block ${className}`}>
      <div className="flex items-center space-x-3 p-3 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-lg hover:bg-gruvbox-gray/10 transition-colors">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gruvbox-gray/20 flex-shrink-0">
          {vibe.mediaFiles?.[0] ? (
            <Image
              src={vibe.mediaFiles[0].url}
              alt={vibe.itemName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image
                src="/oldvibes-small.png"
                alt="Old Vibes"
                width={24}
                height={24}
                className="opacity-50"
              />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 truncate">
            {vibe.itemName}
          </h4>
          <p className="text-sm text-gruvbox-yellow font-semibold">
            {formatPrice(vibe.price)}
          </p>
        </div>
        
        <svg className="w-4 h-4 text-gruvbox-gray flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
