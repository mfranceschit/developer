/* eslint-disable @next/next/no-img-element */
import React, { Dispatch, SetStateAction } from 'react';
import { FaX } from 'react-icons/fa6';

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
  const imageSrc = `../../assets/images/${img}`;
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
            <picture>
              <img
                src={imageSrc}
                alt={`${title} project image`}
                className={styles.cardImgPlaceholder}
              />
            </picture>
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
