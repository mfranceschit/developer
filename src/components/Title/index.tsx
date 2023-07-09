import React, { ReactNode } from 'react';
import styles from './styles.module.css';

const Title = ({ children }: { children: ReactNode }) => (
  <h1 className={styles.title}>{children}</h1>
);

export default Title;
