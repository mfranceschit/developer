import React, { Dispatch, SetStateAction } from 'react';
import { FaX } from 'react-icons/fa6';
import Image from 'next/image';

import styles from './styles.module.css';
import { Project } from '@/types';

const ProjectDetails = ({
  project,
  setSelectedProject,
}: {
  project: Project;
  setSelectedProject: Dispatch<SetStateAction<Project | undefined>>;
}) => {
  const { title, info, img } = project;
  return (
    <>
      <div className={styles.cardHeader}>
        <button onClick={() => setSelectedProject(undefined)}>
          <FaX size={30} />
        </button>
      </div>
      <div className={styles.cardContent}>
        <h2>{title}</h2>
        <div className={styles.projectInformation}>
          <div className={styles.imageContainer}>
            <Image
              src={require(`../../assets/images/${img}`)}
              fill
              alt={`${title} project image`}
              className={styles.cardImgPlaceholder}
            />
          </div>
          <div className={styles.cardTextPlaceholder}>
            <p>{info}</p>
            <p>{info}</p>
            <p>{info}</p>
            <p>{info}</p>
            <p>{info}</p>
            <p>{info}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetails;
