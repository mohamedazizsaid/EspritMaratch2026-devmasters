import { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ScrollRevealProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'zoom';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  viewportOnce?: boolean;
}

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.55,
  distance = 30,
  className = '',
  viewportOnce = true,
  ...rest
}: ScrollRevealProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: distance, x: 0, scale: 1 };
      case 'down':
        return { opacity: 0, y: -distance, x: 0, scale: 1 };
      case 'left':
        return { opacity: 0, x: distance, y: 0, scale: 1 };
      case 'right':
        return { opacity: 0, x: -distance, y: 0, scale: 1 };
      case 'zoom':
        return { opacity: 0, y: 0, x: 0, scale: 0.94 };
      case 'fade':
      default:
        return { opacity: 0, y: 0, x: 0, scale: 1 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: viewportOnce, amount: 0.12 }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98], // Spring-like smooth bezier
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered container for animating lists/grids on scroll
 */
interface ScrollRevealGroupProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
}

export function ScrollRevealGroup({
  children,
  className = '',
}: ScrollRevealGroupProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
