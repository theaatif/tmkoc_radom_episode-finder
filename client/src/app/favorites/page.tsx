"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  return (
    <div className="flex flex-col flex-1 p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Favorites</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Episodes you have favorited and saved.
          </p>
        </div>
        <Button variant="secondary">Share Favorites</Button>
      </div>

      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            No favorites yet
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Go back to the homepage, generate some random episodes, and click the heart icon on your favorite ones to save them here.
          </p>
        </div>
      </main>
    </div>
  );
}
