export interface DayViewportPosition {
  day: number;
  top: number;
  bottom: number;
}

/**
 * Activate a day while optionally closing the previously managed day.
 * Scroll-driven activation keeps earlier days open so collapsing content above
 * the viewport cannot pull the page backwards.
 */
export function getOpenDaysAfterActivation(
  currentOpenDays: ReadonlySet<number>,
  day: number,
  previousManagedDay: number | null,
  closePrevious: boolean,
) {
  const shouldClosePrevious =
    closePrevious &&
    previousManagedDay !== null &&
    previousManagedDay !== day &&
    currentOpenDays.has(previousManagedDay);
  const shouldOpenDay = !currentOpenDays.has(day);

  if (!shouldClosePrevious && !shouldOpenDay) return currentOpenDays;

  const nextOpenDays = new Set(currentOpenDays);
  if (shouldClosePrevious) nextOpenDays.delete(previousManagedDay);
  nextOpenDays.add(day);
  return nextOpenDays;
}

/**
 * Resolve only hashes owned by the itinerary. Unknown or malformed hashes are
 * intentionally ignored so normal browser anchor behaviour remains available.
 */
export function getDayFromHash(hash: string, validDays: ReadonlySet<number>) {
  const match = /^#day-(\d+)$/.exec(hash);
  if (!match) return null;

  const day = Number(match[1]);
  return validDays.has(day) ? day : null;
}

/**
 * The reading line sits low enough that the next summary is visible before it
 * opens, while still leaving enough of the viewport for its content.
 */
export function getReadingActivationLine(viewportHeight: number) {
  return Math.max(180, viewportHeight * 0.72);
}

/**
 * Return the last day whose card has entered the main reading area. A tall,
 * currently-open day and the next summary can overlap the line; choosing the
 * latter is what advances the itinerary while scrolling down.
 */
export function findDayInReadingArea(
  positions: readonly DayViewportPosition[],
  viewportHeight: number,
) {
  const readingTop = Math.min(180, Math.max(96, viewportHeight * 0.12));
  const activationLine = getReadingActivationLine(viewportHeight);
  let candidate: number | null = null;

  for (const position of positions) {
    if (position.bottom > readingTop && position.top <= activationLine) {
      candidate = position.day;
    }
  }

  return candidate;
}
