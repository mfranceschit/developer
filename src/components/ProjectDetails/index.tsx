import React, { Dispatch, SetStateAction } from 'react';
import { FaX } from 'react-icons/fa6';
import Image from 'next/image';

import { Project } from '@/types';
import { useImageSize } from '@/hooks/useImageSize';

const ProjectDetails = ({
  project,
  setSelectedProject,
}: {
  project: Project;
  setSelectedProject: Dispatch<SetStateAction<Project | undefined>>;
}) => {
  const { title, url, description, img } = project;
  const imageSrc = `/assets/images/${img}`;
  const { width, height } = useImageSize();

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
          <div className="image-container">
            <a rel="noopener noreferrer" target="_blank" href={url}>
              <Image
                src={imageSrc}
                height={height}
                width={width}
                className="card-img-placeholder"
                alt={`${title} project image`}
              />
            </a>
          </div>
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
