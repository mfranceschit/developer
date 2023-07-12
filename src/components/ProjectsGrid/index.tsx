import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import styles from './styles.module.css';
import ProjectCard from '../ProjectCard';
import ProjectDetails from '../ProjectDetails';

const wrapperVariants = {
  initial: {
    clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)',
    transition: { duration: 0.4 },
  },
  animate: {
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    transition: { duration: 0.4, staggerChildren: 0.1 },
  },
  exit: {
    clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
    transition: { duration: 0.4 },
  },
};

export const ProjectsGrid = ({ projects }: { projects: string[] }) => {
  const [selectedSquare, setSelectedSquare] = useState<string>('');

  const dynamicStyles: {
    [type: string]: {
      container: string;
      card: string;
    };
  } = {
    even: {
      container: styles.cpTransitionContaineryellow,
      card: styles.cardWrapperyellow,
    },
    odd: {
      container: styles.cpTransitionContainergreen,
      card: styles.cardWrappergreen,
    },
  };

  return (
    <div className={`${styles.cpTransition} ${styles.cpTransitionContainer}`}>
      <AnimatePresence mode={selectedSquare ? 'sync' : 'wait'} initial={false}>
        {selectedSquare ? (
          <motion.div
            className={`${styles.card} ${styles.cardWrapper} ${dynamicStyles[selectedSquare].card}`}
            key="card"
            variants={wrapperVariants}
            initial="initial"
            animate="animate"
            exit="exit">
            <ProjectDetails setSelectedSquare={setSelectedSquare} />
          </motion.div>
        ) : (
          <motion.div
            className={styles.cpTransitionSquaresWrapper}
            key="squares"
            variants={{
              ...wrapperVariants,
              exit: {
                opacity: 1,
                transition: { duration: 0.4 },
              },
            }}
            initial="initial"
            animate="animate"
            exit="exit">
            {projects.map((name: string, i) => (
              <ProjectCard
                key={i}
                name={name}
                index={i}
                setSelectedSquare={setSelectedSquare}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
