# Episode Generation Algorithm

## Problem

Given a catalog of ~4,000 episodes and per-user watch history, return up to 4 random
episodes the user has **not yet watched**, optionally filtered by genre.

The naive approach — load all watched IDs into memory and pass them to `$nin` — grows
linearly with watch history. A user who's watched 3,000 episodes ships 3,000 ObjectIds in
every request.

## Algorithm: Random-Candidate + Post-Filter

### Core idea

Instead of excluding watched episodes from the query, sample a small random batch from the
catalog and check only those against the user's watch history.

### Steps

```
1. $sample 8 random episodes from the catalog (or genre subset)
2. Query WatchHistory for those 8 specific episode IDs (index-covered)
3. Filter out watched ones
4. If fewer than 4 unwatched found, repeat (up to 3 rounds, sampling 2× needed each time)
```

### Complexity

| Cost | Per round | Max (3 rounds) |
|------|-----------|-----------------|
| Episode reads | ≤ 8 | ≤ 24 |
| WatchHistory reads | ≤ 8 (index-covered) | ≤ 24 |
| Network round-trips | 2 | 6 |

**Independent of total watch history size.** Same cost whether user has watched 5 or 3,900 episodes.

### Degradation guarantee

When the user has watched N of M episodes:

- Probability of a single candidate being watched = N/M
- With 8 candidates per round and 3 rounds, probability of failing to find 4 unwatched
  when only 40 remain (N/M = 99% watched): < 0.2%

The `seenIds` Set deduplicates across rounds, so the same episode never appears twice.

### Remaining count

```
If genre filter:
  total  = count Episodes matching genre
  watched = count WatchHistory where episode is in that genre
  remaining = max(0, total - watched)

If no genre:
  remaining = all Episodes - all user's WatchHistory
```

## Why not $nin

```js
// Bad: grows with watch history
const watchedIds = await WatchHistory.find({ userId }).select('episodeId'); // 3000 docs
await Episode.aggregate([
  { $match: { _id: { $nin: watchedIds } } }, // 3000-element array in query
  { $sample: { size: 4 } }
]);
```

`$nin` with large arrays can't use indexes effectively, forces collection scans, and the
array itself consumes query memory.

## Why not $lookup exclusion

```js
// Better than $nin but still scans the entire WatchHistory per episode
await Episode.aggregate([
  { $lookup: { from: 'watchhistories', ... } },
  { $match: { watched: { $size: 0 } } },
  { $sample: { size: 4 } }
]);
```

This does the exclusion in MongoDB, but `$lookup` on an unbounded collection before `$sample`
means the join runs on every episode in the catalog before sampling — still O(catalog size).

## Scaling beyond this

For 100k+ episodes or millions of users, pre-compute an unwatched bitfield per user in Redis:

```
SETBIT user:${id}:watched ${episodeNumber} 1   // on watch
GETBIT user:${id}:watched ${randomNumber}       // on generate
```

500 bytes per user covers 4,000 episodes. Generate becomes zero database queries —
pick random numbers, check bitfield, repeat.

For this app's scale (4k episodes), the random-candidate approach is the right trade-off.
