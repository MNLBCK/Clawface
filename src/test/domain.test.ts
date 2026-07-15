import { describe, expect, it } from 'vitest';
import { calculatePriority, isQuickWin, normalizeRating } from '@/lib/domain';

describe('priority model', () => {
  it('normalizes 1..5 to 0..100', () => { expect(normalizeRating(1)).toBe(0); expect(normalizeRating(5)).toBe(100); });
  it('calculates weighted priority', () => { expect(calculatePriority({ urgency: 5, benefit: 4, delayRisk: 5, disturbanceFrequency: 3, dependencyImpact: 1 })).toBe(78); });
  it('detects quick wins only for short non-specialist work without open dependencies', () => { expect(isQuickWin({ urgency: 5, benefit: 4, delayRisk: 5, disturbanceFrequency: 3, dependencyImpact: 1, effortClass: '1–2 Stunden', difficulty: 'einfach' })).toBe(true); expect(isQuickWin({ urgency: 5, benefit: 4, delayRisk: 5, disturbanceFrequency: 3, dependencyImpact: 1, effortClass: 'halber Tag', difficulty: 'einfach' })).toBe(false); });
});
