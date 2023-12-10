import React, { ReactNode } from 'react';

import styles from './animated-title.module.scss';

const AnimatedTitle: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <h1 className={`${styles.animatedText} ${styles.typewriterAnimation}`}>
      {children}
    </h1>
  );
};

export default AnimatedTitle;
