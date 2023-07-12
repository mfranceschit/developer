import Link from 'next/link';
import React from 'react';
import { FaHouse } from 'react-icons/fa6';
import { usePathname } from 'next/navigation';

import styles from './styles.module.css';
import { ROUTES } from '@/routes';

const Header = () => {
  const path = usePathname();
  return (
    <header className={styles.header}>
      <div className={styles.links}>
        <Link
          href={ROUTES.home}
          passHref
          className={ROUTES.home === path ? styles.active : ''}>
          <FaHouse />
        </Link>
        <Link
          href={ROUTES.about}
          className={ROUTES.about === path ? styles.active : ''}>
          About
        </Link>
        <Link
          href={ROUTES.projects}
          className={ROUTES.projects === path ? styles.active : ''}>
          Work
        </Link>
        <Link
          href={ROUTES.contact}
          className={ROUTES.contact === path ? styles.active : ''}>
          Contact
        </Link>
      </div>
    </header>
  );
};

export default Header;
