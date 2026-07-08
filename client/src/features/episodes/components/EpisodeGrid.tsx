"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FavButton } from "@/components/ui/fav-button";

export interface Episode {
  id: string;
  title: string;
  genre: string;
  thumbnailUrl: string;
  youtubeVideoId: string;
}

interface EpisodeGridProps {
  episodes: Episode[];
  onSelectEpisode: (episode: Episode) => void;
  favoritedIds?: Set<string>;
  onToggleFavorite?: (episode: Episode, isFav: boolean) => void;
}

export function EpisodeGrid({
  episodes,
  onSelectEpisode,
  favoritedIds = new Set(),
  onToggleFavorite,
}: EpisodeGridProps) {
  if (episodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-500">
        No episodes generated yet. Click Generate to start!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {episodes.map((episode) => {
        const isFav = favoritedIds.has(episode.id);
        return (
          <Card
            key={episode.id}
            className="cursor-pointer overflow-hidden transition-all hover:scale-[1.02] hover:shadow-md border border-hairline bg-surface-card hover:bg-brand-white relative group"
            onClick={() => onSelectEpisode(episode)}
          >
            <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-800 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={episode.thumbnailUrl || `https://img.youtube.com/vi/${episode.youtubeVideoId}/0.jpg`}
                alt={episode.title}
                className="h-full w-full object-cover"
              />
              
              {/* Heart Button Overlay */}
              {onToggleFavorite && (
                <FavButton
                  isFav={isFav}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleFavorite) onToggleFavorite(episode, isFav);
                  }}
                  size="sm"
                  className="absolute top-2 right-2"
                />
              )}
            </div>
            <CardHeader className="p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-text">
                {episode.genre}
              </span>
              <CardTitle className="mt-1 text-base line-clamp-2 leading-snug font-bold text-ink">
                {episode.title}
              </CardTitle>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
