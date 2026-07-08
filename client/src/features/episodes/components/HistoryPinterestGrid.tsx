"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { FavButton } from "@/components/ui/fav-button";
import { Play } from "lucide-react";

export interface HistoryEpisode {
  id: string;
  title: string;
  genre: string;
  thumbnailUrl: string;
  youtubeVideoId: string;
  watchedAt: string;
}

interface HistoryPinterestGridProps {
  episodes: HistoryEpisode[];
  onSelectEpisode: (episode: { id: string; youtubeVideoId: string }) => void;
  favoritedIds?: Set<string>;
  onToggleFavorite?: (episodeId: string, isFav: boolean) => void;
}

function WatchedDate({ date }: { date: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>&nbsp;</>;
  return (
    <>{new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}</>
  );
}

export function HistoryPinterestGrid({
  episodes,
  onSelectEpisode,
  favoritedIds = new Set(),
  onToggleFavorite,
}: HistoryPinterestGridProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (episodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-500 bg-surface-card rounded-[24px] border border-hairline w-full">
        No watch history found. Start exploring episodes!
      </div>
    );
  }

  // Stagger items round-robin to 2 or 4 columns
  const columnsCount = isMobile ? 2 : 4;
  const col1 = episodes.filter((_, i) => i % columnsCount === 0);
  const col2 = episodes.filter((_, i) => i % columnsCount === 1);
  const col3 = columnsCount === 4 ? episodes.filter((_, i) => i % 4 === 2) : [];
  const col4 = columnsCount === 4 ? episodes.filter((_, i) => i % 4 === 3) : [];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-6 p-1 bg-transparent">
        <Column
          episodes={col1}
          favoritedIds={favoritedIds}
          onToggleFavorite={onToggleFavorite}
          onSelectEpisode={onSelectEpisode}
        />
        <Column
          episodes={col2}
          favoritedIds={favoritedIds}
          onToggleFavorite={onToggleFavorite}
          onSelectEpisode={onSelectEpisode}
        />
        {columnsCount === 4 && (
          <>
            <Column
              episodes={col3}
              favoritedIds={favoritedIds}
              onToggleFavorite={onToggleFavorite}
              onSelectEpisode={onSelectEpisode}
            />
            <Column
              episodes={col4}
              favoritedIds={favoritedIds}
              onToggleFavorite={onToggleFavorite}
              onSelectEpisode={onSelectEpisode}
            />
          </>
        )}
      </div>
    </div>
  );
}

type ColumnProps = {
  episodes: HistoryEpisode[];
  favoritedIds: Set<string>;
  onToggleFavorite?: (episodeId: string, isFav: boolean) => void;
  onSelectEpisode: (episode: { id: string; youtubeVideoId: string }) => void;
};

// Generates highly random but stable styles based on ID hashing (Aspect ratio, Margin stagger, Hover micro-rotations)
function getCardStyling(episodeId: string) {
  let hash = 0;
  for (let i = 0; i < episodeId.length; i++) {
    hash = episodeId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);
  
  // Aspect ratio presets (6 levels of height)
  const aspectMod = absHash % 6;
  let aspectClass = "aspect-[3/4.2]";
  if (aspectMod === 0) aspectClass = "aspect-[3/3.4]";
  else if (aspectMod === 1) aspectClass = "aspect-[3/3.8]";
  else if (aspectMod === 2) aspectClass = "aspect-[3/4.2]";
  else if (aspectMod === 3) aspectClass = "aspect-[3/4.6]";
  else if (aspectMod === 4) aspectClass = "aspect-[3/5.0]";
  else if (aspectMod === 5) aspectClass = "aspect-[3/5.4]";

  // Vertical margin offsets to stagger alignment
  const marginMod = absHash % 4;
  let marginClass = "";
  if (marginMod === 1) marginClass = "mt-3";
  else if (marginMod === 2) marginClass = "mt-6";
  else if (marginMod === 3) marginClass = "mt-9";

  // Micro hover tilt
  const rotateMod = absHash % 3;
  let rotateClass = "";
  if (rotateMod === 1) rotateClass = "hover:rotate-[0.8deg]";
  else if (rotateMod === 2) rotateClass = "hover:-rotate-[0.8deg]";

  return `${aspectClass} ${marginClass} ${rotateClass}`;
}

const Column = ({
  episodes,
  favoritedIds,
  onToggleFavorite,
  onSelectEpisode,
}: ColumnProps) => {
  if (episodes.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 w-full">
      {episodes.map((episode) => {
        const isFav = favoritedIds.has(episode.id);
        const stylingClasses = getCardStyling(episode.id);
        
        return (
          <div
            key={episode.id + "-" + episode.watchedAt}
            className={`relative w-full ${stylingClasses} rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-200/40 hover:border-slate-300/60 dark:border-zinc-800/40 dark:hover:border-zinc-700/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] group/card cursor-pointer bg-black isolate`}
            style={{
              WebkitMaskImage: "-webkit-radial-gradient(white, black)",
            }}
            onClick={() =>
              onSelectEpisode({
                id: episode.id,
                youtubeVideoId: episode.youtubeVideoId,
              })
            }
          >
            {/* Image background */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={episode.thumbnailUrl || `https://img.youtube.com/vi/${episode.youtubeVideoId}/0.jpg`}
              alt={episode.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105 pointer-events-none"
            />

            {/* Dark gradient text overlay at the bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent z-10 flex flex-col justify-end p-5 gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Genre tag */}
                <span className="text-[9px] font-bold text-brand-cyan tracking-wider uppercase bg-brand-cyan/20 backdrop-blur-md border border-brand-cyan/20 px-2 py-0.5 rounded-full">
                  {episode.genre}
                </span>
                
                {/* Watched Date */}
                <span className="text-[9px] text-zinc-300 font-bold bg-black/35 backdrop-blur-sm px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <WatchedDate date={episode.watchedAt} />
                </span>
              </div>

              {/* Episode Title */}
              <h3 className="font-display text-xs sm:text-sm font-bold text-brand-white leading-snug line-clamp-3">
                {episode.title}
              </h3>
            </div>

            {/* Heart Button Overlay */}
            {onToggleFavorite && (
              <div className="absolute top-3 right-3 z-20">
                <FavButton
                  isFav={isFav}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(episode.id, isFav);
                  }}
                  size="sm"
                  className="shadow-md bg-black/40 hover:bg-black/60 border border-white/10 text-white/90"
                />
              </div>
            )}

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-15">
              <div className="h-12 w-12 rounded-full bg-brand-white/95 text-ink flex items-center justify-center shadow-lg transform scale-75 group-hover/card:scale-100 transition-transform duration-300">
                <Play className="h-5 w-5 fill-ink text-ink ml-0.5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
