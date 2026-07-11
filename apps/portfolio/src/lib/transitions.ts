import type { TransitionDirectionalAnimations } from 'astro';

export const waveSweep: TransitionDirectionalAnimations = {
  forwards: {
    old: { name: 'wave-fade-out', duration: '0.45s', easing: 'ease', fillMode: 'forwards' },
    new: { name: 'wave-sweep-in', duration: '0.45s', easing: 'ease-in-out', fillMode: 'both' },
  },
  backwards: {
    old: { name: 'wave-fade-out', duration: '0.45s', easing: 'ease', fillMode: 'forwards' },
    new: { name: 'wave-sweep-in', duration: '0.45s', easing: 'ease-in-out', fillMode: 'both' },
  },
};
