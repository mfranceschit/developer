import React from 'react';
import { FaGithub, FaGitlab, FaLinkedin, FaMedium } from 'react-icons/fa6';

import styles from './social-buttons.module.scss';

const SocialButtons = ({ size }: { size: number }) => (
  <div className={styles.socialLinks}>
    <a
      title="linkedin"
      href="https://www.linkedin.com/in/mfranceschit/"
      rel="noopener noreferrer"
      target="_blank"
      aria-label="linkedin">
      <FaLinkedin size={size} />
    </a>
    <a
      title="github"
      href="https://github.com/mfranceschit"
      rel="noopener noreferrer"
      target="_blank"
      aria-label="github">
      <FaGithub size={size} />
    </a>
    <a
      title="gitlab"
      href="https://gitlab.com/mfranceschit"
      rel="noopener noreferrer"
      target="_blank"
      aria-label="gitlab">
      <FaGitlab size={size} />
    </a>
    <a
      title="medium"
      href="https://medium.com/@mfranceschit"
      rel="noopener noreferrer"
      target="_blank"
      aria-label="medium">
      <FaMedium size={size} />
    </a>
  </div>
);

export default SocialButtons;
