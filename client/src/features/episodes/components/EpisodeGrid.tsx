"use client";

import * as React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
}

export function EpisodeGrid({ episodes, onSelectEpisode }: EpisodeGridProps) {
  if (episodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-500">
        No episodes generated yet. Click Generate to start!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {episodes.map((episode) => (
        <Card
          key={episode.id}
          className="cursor-pointer overflow-hidden transition-all hover:scale-[1.02] hover:shadow-md"
          onClick={() => onSelectEpisode(episode)}
        >
          <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={episode.thumbnailUrl || "/api/placeholder/400/225"}
              alt={episode.title}
              className="h-full w-full object-cover"
            />
          </div>
          <CardHeader className="p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {episode.genre}
            </span>
            <CardTitle className="mt-1 text-base line-clamp-2">{episode.title}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
