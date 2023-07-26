/* eslint-disable @next/next/no-img-element */
import React, { Dispatch, SetStateAction } from 'react';
import { FaX } from 'react-icons/fa6';

import { Project } from '@/types';

const ProjectDetails = ({
  project,
  setSelectedProject,
}: {
  project: Project;
  setSelectedProject: Dispatch<SetStateAction<Project | undefined>>;
}) => {
  const { title, url, description, img } = project;
  const imageSrc = `../../assets/images/${img}`;
  return (
    <>
      <div className="card-header">
        <button onClick={() => setSelectedProject(undefined)}>
          <FaX size={30} />
        </button>
      </div>
      <div className="card-content">
        <h2>{title}</h2>
        <div className="project-information">
          <a rel="noopener noreferrer" target="_blank" href={url}>
            <picture>
              <img
                src={imageSrc}
                alt={`${title} project image`}
                className="card-img-placeholder"
              />
            </picture>
          </a>
          <div className="card-text-placeholder">
            {description.map((p, i) => (
              <p key={i} className="project-text-paragraph">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetails;
