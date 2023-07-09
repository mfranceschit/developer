import React from 'react';
import { FaLinkedin, FaMedium, FaGitlab, FaGithub } from 'react-icons/fa';

import styles from './styles.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.socialLinks}>
        <a
          href="https://www.linkedin.com/in/mfranceschit/"
          rel="noopener noreferrer"
          target="_blank"
          aria-label="linkedin">
          <FaLinkedin size={24} />
        </a>
        <a
          href="https://github.com/mfranceschit"
          rel="noopener noreferrer"
          target="_blank"
          aria-label="github">
          <FaGithub size={24} />
        </a>
        <a
          href="https://gitlab.com/mfranceschit"
          rel="noopener noreferrer"
          target="_blank"
          aria-label="gitlab">
          <FaGitlab size={24} />
        </a>
        <a
          href="https://medium.com/@mfranceschit"
          rel="noopener noreferrer"
          target="_blank"
          aria-label="medium">
          <FaMedium size={24} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
