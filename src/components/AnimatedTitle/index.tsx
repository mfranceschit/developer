import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Title from '../Title';

import styles from './styles.module.css';

const AnimatedTitle = ({ text }: { text: string }) => {
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    if (!animationStarted) {
      setAnimationStarted(true);
    }
  }, []);

  const wordAnimation = {
    hidden: {},
    visible: {},
  };

  const characterAnimation = {
    hidden: {
      opacity: 0,
      y: `0.25em`,
    },
    visible: {
      opacity: 1,
      y: `0em`,
      transition: {
        duration: 1,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  };

  return (
    <h1 className={`${styles.line} ${styles.typewriterAnimation}`}>{text}</h1>
  );
};

export default AnimatedTitle;
