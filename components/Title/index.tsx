import React, { ReactNode } from 'react';

import styles from './title.module.scss';

const Title = ({ children }: { children: ReactNode }) => (
  <h1 className={styles.mainTitle}>{children}</h1>
);

export default Title;
