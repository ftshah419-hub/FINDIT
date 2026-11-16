/**
 * Standardized Animation Variants for FINDIT
 * High performance (transform and opacity only), targeting 60fps
 */

export const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1], // Custom cubic bezier for smooth SaaS deceleration
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const alertVariants = {
  initial: { opacity: 0, height: 0, y: -6 },
  animate: {
    opacity: 1,
    height: 'auto',
    y: 0,
    transition: {
      duration: 0.28,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    y: -6,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

export const buttonTap = {
  whileHover: { scale: 1.012 },
  whileTap: { scale: 0.985 },
  transition: { duration: 0.12 },
};

export const ssoButtonTap = {
  whileHover: { scale: 1.02, y: -1 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.12 },
};
