import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { FaX } from 'react-icons/fa6';
import Image from 'next/image';

import { Project } from '@/types';
import { useImageSize } from '@/hooks/useImageSize';
import { useLanguage } from '@/hooks/useLanguage';

const ProjectDetails = ({
  project,
  setSelectedProject,
}: {
  project: Project;
  setSelectedProject: Dispatch<SetStateAction<Project | undefined>>;
}) => {
  const { width, height } = useImageSize();
  const {
    content: { projects },
  } = useLanguage();
  const { stack, summary } = projects;
  const { title, url, description, img, technologies } = project;
  const imageSrc = `/assets/images/${img}`;

  useEffect(() => {
    if (window.scrollY > 0) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, []);

  return (
    <>
      <div className="card-header">
        <button onClick={() => setSelectedProject(undefined)}>
          <FaX size={30} />
        </button>
      </div>
      <div className="card-content">
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
        <div className="project-information">
          <div className="card-text-placeholder">
            <h2>{title}</h2>
            <h4>{stack}:</h4>
            <div className="technologies-container">
              {technologies.map((t: string, index: number) => (
                <span key={index}>{t}</span>
              ))}
            </div>
            <h4>{summary}:</h4>
            {description.map((p, i) => (
              <p key={i} className="project-text-paragraph">
                {p}
              </p>
            ))}
            <div className="text-bottom-space" />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetails;
