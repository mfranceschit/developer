import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import styles from './styles.module.css';
import ProjectCard from '../ProjectCard';
import ProjectDetails from '../ProjectDetails';
import { Project } from '@/types';

const wrapperVariants = {
  initial: {
    clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)',
    transition: { duration: 0.6 },
  },
  animate: {
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    transition: { duration: 0.6, staggerChildren: 0.1 },
  },
  exit: {
    clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
    transition: { duration: 0.6 },
  },
};

export const ProjectsGrid = ({ projects = [] }: { projects: Project[] }) => {
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();

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
      <AnimatePresence mode={selectedProject ? 'sync' : 'wait'} initial={false}>
        {selectedProject ? (
          <motion.div
            className={`${styles.card} ${styles.cardWrapper} ${dynamicStyles.even.card}`}
            key="card"
            variants={wrapperVariants}
            initial="initial"
            animate="animate"
            exit="exit">
            <ProjectDetails
              project={selectedProject}
              setSelectedProject={setSelectedProject}
            />
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
            {projects.map((project: Project, i) => (
              <ProjectCard
                key={i}
                index={i}
                project={project}
                setSelectedProject={setSelectedProject}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
