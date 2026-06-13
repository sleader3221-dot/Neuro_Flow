// NeuroFlow AI — SM-2 Spaced Repetition Algorithm
// Based on the SuperMemo SM-2 algorithm

/**
 * SM-2 Algorithm
 * quality: 0-5 (0=blackout, 5=perfect)
 * Returns updated card data
 */
export function sm2Review(card, quality) {
  let { repetitions = 0, easeFactor = 2.5, interval = 1 } = card;

  // Calculate new ease factor
  const newEaseFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  let newInterval;
  let newRepetitions;

  if (quality < 3) {
    // Failed — reset repetitions
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions = repetitions + 1;
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
  }

  const nextReview = new Date(
    Date.now() + newInterval * 24 * 60 * 60 * 1000
  ).toISOString();

  return {
    ...card,
    repetitions: newRepetitions,
    easeFactor: parseFloat(newEaseFactor.toFixed(2)),
    interval: newInterval,
    nextReview,
    lastReviewed: new Date().toISOString(),
    quality,
  };
}

/**
 * Get cards due for review today
 */
export function getDueCards(cards) {
  const now = new Date();
  return cards.filter(card => new Date(card.nextReview) <= now);
}

/**
 * Get learning statistics
 */
export function getCardStats(cards) {
  const total = cards.length;
  const mastered = cards.filter(c => c.repetitions >= 5 && c.easeFactor >= 2.5).length;
  const learning = cards.filter(c => c.repetitions > 0 && c.repetitions < 5).length;
  const newCards = cards.filter(c => c.repetitions === 0).length;
  const dueToday = getDueCards(cards).length;

  return { total, mastered, learning, newCards, dueToday };
}

/**
 * Calculate mastery percentage for a deck
 */
export function getMasteryPercent(cards) {
  if (!cards.length) return 0;
  const mastered = cards.filter(c => c.repetitions >= 5).length;
  return Math.round((mastered / cards.length) * 100);
}

/**
 * Get difficulty label
 */
export function getDifficultyLabel(quality) {
  if (quality <= 1) return { label: 'Again', color: '#ef4444' };
  if (quality <= 2) return { label: 'Hard', color: '#f97316' };
  if (quality <= 3) return { label: 'Good', color: '#f59e0b' };
  if (quality <= 4) return { label: 'Easy', color: '#10b981' };
  return { label: 'Perfect', color: '#06b6d4' };
}

/**
 * Project future reviews (next 7 days)
 */
export function getUpcomingReviews(cards) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const count = cards.filter(card => {
      const reviewDate = new Date(card.nextReview).toISOString().split('T')[0];
      return reviewDate === dateStr;
    }).length;
    days.push({ date: dateStr, count, label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en', { weekday: 'short' }) });
  }
  return days;
}
