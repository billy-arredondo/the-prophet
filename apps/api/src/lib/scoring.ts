/**
 * Pure scoring function — no I/O, no side effects.
 * Imported by the scoring service and the tests.
 */
import { POINTS } from '@the-prophet/shared';

/**
 * Compute prediction points given the actual final score.
 *
 * Rules:
 * - EXACT  (3 pts): predicted score equals actual score exactly.
 * - OUTCOME (1 pt): correct winner/draw but wrong goal count.
 * - WRONG  (0 pts): wrong outcome.
 */
export function scorePrediction(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number,
): number {
  // Exact score
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return POINTS.EXACT;
  }

  const predictedOutcome = Math.sign(predictedHome - predictedAway); // -1 | 0 | 1
  const actualOutcome = Math.sign(actualHome - actualAway);

  if (predictedOutcome === actualOutcome) {
    return POINTS.OUTCOME;
  }

  return POINTS.WRONG;
}
