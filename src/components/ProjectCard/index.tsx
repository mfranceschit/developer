import React, { Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';

import styles from './styles.module.css';

const squareVariants = {
  initial: {
    opacity: 0,
    scale: 0.3,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
};

const square: { [type: string]: string } = {
  even: styles.evensquare,
  odd: styles.oddsquare,
};

const ProjectCard = ({
  name,
  index,
  setSelectedSquare,
}: {
  name: string;
  index: number;
  setSelectedSquare: Dispatch<SetStateAction<string>>;
}) => {
  const type = index % 2 ? 'even' : 'odd';
  return (
    <motion.div
      className={`${styles.square} ${square[type]}`}
      onClick={() => setSelectedSquare(type)}
      variants={squareVariants}
      transition={{ duration: 0.2, type: 'spring' }}>
      <div className={styles.content}>
        <h3>{name}</h3>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
