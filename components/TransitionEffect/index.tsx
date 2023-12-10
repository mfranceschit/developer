'use client';

import React, { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

import Title from '@/components/Title';
import en from '@/locales/en';

const variants = {
  fadeIn: {
    y: 100,
    opacity: 0,
    transition: {
      duration: 1,
      ease: 'easeInOut',
    },
  },
  inactive: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: 'easeInOut',
    },
  },
  fadeOut: {
    opacity: 0,
    y: -100,
    transition: {
      duration: 1,
      ease: 'easeInOut',
    },
  },
};

const TransitionEffect = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const { title = '' } = en.home;

  return (
    <div className="effect">
      <AnimatePresence initial={false} mode="wait">
        <motion.section
          className="container"
          key={pathname}
          variants={variants}
          initial="fadeIn"
          animate="inactive"
          exit="fadeOut">
          <Title>{title}</Title>
          {children}
        </motion.section>
      </AnimatePresence>
    </div>
  );
};

export default TransitionEffect;
