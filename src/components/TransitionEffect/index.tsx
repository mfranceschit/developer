import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';

import { useLanguage } from '@/hooks/useLanguage';
import Title from '@/components/Title';

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
  const { asPath } = useRouter();
  const currentPage = asPath.replace('/', '');
  const { content } = useLanguage();
  const { title = '' } = content[currentPage]
    ? content[currentPage]
    : content['home'];

  return (
    <div className="effect">
      <AnimatePresence initial={false} mode="wait">
        <motion.section
          className="container"
          key={asPath}
          variants={variants}
          initial="fadeIn"
          animate="inactive"
          exit="fadeOut">
          {content[currentPage] && <Title>{title}</Title>}
          {children}
        </motion.section>
      </AnimatePresence>
    </div>
  );
};

export default TransitionEffect;
