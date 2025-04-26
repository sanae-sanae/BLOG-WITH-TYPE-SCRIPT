import { MotionValue, useTransform, useSpring } from 'framer-motion';

export const animatedProperties = {
  cardFlip: {
    duration: 0.6,
    ease: [0.23, 1, 0.32, 1], // cubic-bezier(0.23, 1, 0.32, 1)
  },
  float: {
    y: {
      duration: 6,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut" as const,
    },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 },
  },
  slideIn: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.3 },
  },
  slideInUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.4 },
  },
  hover: {
    scale: 1.02,
    y: -10,
    transition: { duration: 0.3 },
  },
  darkHover: {
    scale: 1.02,
    boxShadow: "0 10px 30px -10px rgba(138, 75, 255, 0.25)",
    transition: { duration: 0.3 },
  },
  pulse: {
    scale: [1, 1.02, 1],
    transition: { 
      duration: 2, 
      repeat: Infinity,
      ease: "easeInOut" as const
    },
  },
  shimmer: {
    x: ["100%", "-100%"],
    transition: { 
      duration: 2, 
      repeat: Infinity,
      ease: "linear" as const
    },
  },
  gradientFlow: {
    backgroundPosition: ["0% center", "100% center", "0% center"],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "linear" as const,
    },
  }
};

export function useSmoothTransform(
  value: MotionValue<number>, 
  inputRange: number[], 
  outputRange: number[], 
  config = { stiffness: 100, damping: 30, mass: 1 }
) {
  const transform = useTransform(value, inputRange, outputRange);
  return useSpring(transform, config);
}
