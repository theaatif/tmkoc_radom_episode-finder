export function cn(...inputs: (string | undefined | null | boolean | {[key: string]: boolean})[]) {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === "string") {
      classes.push(input);
    } else if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }
  
  return classes.join(" ");
}

/**
 * Generates stable pseudo-random styling variants based on an ID hash.
 * Used by Pinterest-style masonry grids for organic visual variety.
 */
export function getMasonryCardStyling(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);

  const aspectMap: Record<number, string> = {
    0: "aspect-[3/3.4]",
    1: "aspect-[3/3.8]",
    2: "aspect-[3/4.2]",
    3: "aspect-[3/4.6]",
    4: "aspect-[3/5.0]",
    5: "aspect-[3/5.4]",
  };
  const aspectClass = aspectMap[absHash % 6];

  const marginMap: Record<number, string> = {
    0: "", 1: "mt-3", 2: "mt-6", 3: "mt-9",
  };
  const marginClass = marginMap[absHash % 4];

  const rotateMap: Record<number, string> = {
    0: "", 1: "hover:rotate-[0.8deg]", 2: "hover:-rotate-[0.8deg]",
  };
  const rotateClass = rotateMap[absHash % 3];

  return `${aspectClass} ${marginClass} ${rotateClass}`;
}
