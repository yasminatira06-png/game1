import confetti from 'canvas-confetti';

export function fireCelebrationConfetti() {
  try {
    // Left burst
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#F59E0B', '#10B981', '#38BDF8', '#EC4899', '#FACC15'],
    });

    // Right burst
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#F59E0B', '#10B981', '#38BDF8', '#EC4899', '#FACC15'],
    });
  } catch {}
}

export function fireGrandCelebration() {
  try {
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }

      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#F59E0B', '#10B981', '#38BDF8', '#EC4899', '#FACC15', '#A855F7'],
      });
    }, 250);
  } catch {}
}
