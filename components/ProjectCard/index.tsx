import React, { Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';

import { Project } from '@/types';

const squareVariants = {
  initial: {
    scale: 0.01,
  },
  animate: {
    scale: 1,
  },
};

const ProjectCard = ({
  project,
  setSelectedProject,
}: {
  project: Project;
  setSelectedProject: Dispatch<SetStateAction<Project | undefined>>;
}) => {
  const { title } = project;
  return (
    <motion.div
      className={`square square-box`}
      onClick={() => setSelectedProject(project)}
      variants={squareVariants}
      transition={{ duration: 0.2, type: 'spring' }}>
      <div className="box-content">
        <h3>{title}</h3>
      </div>
    </motion.div>
  );
};

export default ProjectCard;