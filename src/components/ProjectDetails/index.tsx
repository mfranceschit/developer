import React, { Dispatch, SetStateAction } from 'react';
import { FaPhone } from 'react-icons/fa6';

import styles from './styles.module.css';

const ProjectDetails = ({
  setSelectedSquare,
}: {
  setSelectedSquare: Dispatch<SetStateAction<string>>;
}) => {
  return (
    <>
      <div className={styles.cardHeader}>
        <h2>Lorem ipsum</h2>
        <button onClick={() => setSelectedSquare('')}>
          <FaPhone size={30} />
        </button>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardImgPlaceholder} />
        <div className={styles.cardTextPlaceholder}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit ea
          neque quidem exercitationem possimus.
        </div>
      </div>
    </>
  );
};

export default ProjectDetails;
