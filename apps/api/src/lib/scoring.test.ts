/**
 * Unit tests for the pure scorePrediction function.
 * Run with: pnpm test (vitest)
 */
import { describe, it, expect } from 'vitest';
import { scorePrediction } from './scoring.js';
import { POINTS } from '@the-prophet/shared';

describe('scorePrediction', () => {
  // ── EXACT score ─────────────────────────────────────────────────────────────
  describe('EXACT (3 pts)', () => {
    it('awards EXACT for matching home win', () => {
      expect(scorePrediction(2, 1, 2, 1)).toBe(POINTS.EXACT);
    });

    it('awards EXACT for matching away win', () => {
      expect(scorePrediction(0, 3, 0, 3)).toBe(POINTS.EXACT);
    });

    it('awards EXACT for matching draw', () => {
      expect(scorePrediction(1, 1, 1, 1)).toBe(POINTS.EXACT);
    });

    it('awards EXACT for 0-0 draw', () => {
      expect(scorePrediction(0, 0, 0, 0)).toBe(POINTS.EXACT);
    });
  });

  // ── OUTCOME correct ─────────────────────────────────────────────────────────
  describe('OUTCOME (1 pt)', () => {
    it('awards OUTCOME for correct home win, wrong score', () => {
      expect(scorePrediction(3, 0, 2, 1)).toBe(POINTS.OUTCOME);
    });

    it('awards OUTCOME for correct away win, wrong score', () => {
      expect(scorePrediction(0, 1, 0, 4)).toBe(POINTS.OUTCOME);
    });

    it('awards OUTCOME for correct draw, wrong score (different goals)', () => {
      expect(scorePrediction(2, 2, 3, 3)).toBe(POINTS.OUTCOME);
    });

    it('awards OUTCOME for correct draw — 0-0 predicted but 2-2 actual', () => {
      expect(scorePrediction(0, 0, 2, 2)).toBe(POINTS.OUTCOME);
    });
  });

  // ── WRONG outcome ───────────────────────────────────────────────────────────
  describe('WRONG (0 pts)', () => {
    it('awards WRONG for predicted draw but actual home win', () => {
      expect(scorePrediction(1, 1, 2, 0)).toBe(POINTS.WRONG);
    });

    it('awards WRONG for predicted home win but actual away win', () => {
      expect(scorePrediction(2, 0, 0, 1)).toBe(POINTS.WRONG);
    });

    it('awards WRONG for predicted away win but actual draw', () => {
      expect(scorePrediction(0, 2, 1, 1)).toBe(POINTS.WRONG);
    });

    it('awards WRONG for predicted away win but actual home win', () => {
      expect(scorePrediction(1, 3, 3, 1)).toBe(POINTS.WRONG);
    });
  });

  // ── Edge cases ───────────────────────────────────────────────────────────────
  describe('edge cases', () => {
    it('handles high-scoring exact match', () => {
      expect(scorePrediction(10, 10, 10, 10)).toBe(POINTS.EXACT);
    });

    it('handles high-scoring correct outcome', () => {
      // predicted 5-4 home win, actual 7-3 home win → correct outcome
      expect(scorePrediction(5, 4, 7, 3)).toBe(POINTS.OUTCOME);
    });
  });
});
