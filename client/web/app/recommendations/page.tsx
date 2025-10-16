"use client";

import Wrapper from "../_sections/wrapper";
import RecommendationFeed from "../_components/recommendations/RecommendationFeed";
import { IconSparkles } from "@tabler/icons-react";

export default function RecommendationsPage() {
  return (
    <Wrapper>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <IconSparkles className="w-10 h-10 text-gruvbox-orange" />
            <h1 className="text-4xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
              Recommended For You
            </h1>
          </div>
          <p className="text-gruvbox-gray">
            Personalized vibes based on your location, interests, and browsing history
          </p>
        </div>

        {/* Recommendation Feed */}
        <RecommendationFeed limit={20} showFilters={true} />
      </div>
    </Wrapper>
  );
}
