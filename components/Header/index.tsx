'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaHouse } from 'react-icons/fa6';
import { usePathname } from 'next/navigation';

import SocialButtons from '@/components/SocialButtons';
import { ROUTES } from '@/constants/routes';
import en from '@/locales/en';
import styles from './header.module.scss';

const Header = () => {
  const path = usePathname();
  const { about, work, certifications, contact } = en.menu;
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    setOpenMenu(false);
  }, [path]);

  return (
    <header className={styles.header}>
      <input
        type="checkbox"
        className={styles.openSidebarMenu}
        id="openSidebarMenu"
        onChange={() => setOpenMenu(!openMenu)}
        checked={openMenu}
      />
      <label htmlFor="openSidebarMenu" className={styles.sidebarIconToggle}>
        <div
          className={`${styles.spinner} ${styles.diagonal} ${styles.part1}`}></div>
        <div className={`${styles.spinner} ${styles.horizontal}`}></div>
        <div
          className={`${styles.spinner} ${styles.diagonal} ${styles.part2}`}></div>
      </label>
      <div id="sidebarMenu">
        <ul className={styles.sidebarMenuInner}>
          <li>
            <Link
              href={ROUTES.home}
              passHref
              className={ROUTES.home === path ? styles.activePath : ''}>
              <FaHouse />
            </Link>
          </li>
          <li>
            <Link
              href={ROUTES.about}
              className={ROUTES.about === path ? styles.activePath : ''}>
              {about}
            </Link>
          </li>
          <li>
            <Link
              href={ROUTES.projects}
              className={ROUTES.projects === path ? styles.activePath : ''}>
              {work}
            </Link>
          </li>
          <li>
            <Link
              href={ROUTES.certifications}
              className={
                ROUTES.certifications === path ? styles.activePath : ''
              }>
              {certifications}
            </Link>
          </li>
          <li>
            <Link
              href={ROUTES.contact}
              className={ROUTES.contact === path ? styles.activePath : ''}>
              {contact}
            </Link>
          </li>
        </ul>

        <div className={styles.headerSocials}>
          {path !== ROUTES.contact && <SocialButtons size={24} />}
        </div>
      </div>
    </header>
  );
};

export default Header;
