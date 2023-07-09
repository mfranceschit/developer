import React from 'react';
import styles from './styles.module.css';

const CLASSNAME: { [position: string]: string } = {
  top: styles.top,
  bottom: styles.bottom,
  right: styles.right,
  left: styles.left,
};

const Line = ({ position }: { position: string }) => {
  return <div className={`${styles.line} ${CLASSNAME[position]}`} />;
};

export default Line;
