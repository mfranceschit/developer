import React from 'react';
import { usePathname } from 'next/navigation';

import styles from './styles.module.css';
import SocialButtons from '@/components/SocialButtons';
import { ROUTES } from '@/routes';

const Footer = () => {
  const path = usePathname();
  return (
    <footer className={styles.footer}>
      {path !== ROUTES.contact && <SocialButtons size={24} />}
    </footer>
  );
};

export default Footer;
