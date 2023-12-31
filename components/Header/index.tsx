'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaHouse } from 'react-icons/fa6';
import { useParams, usePathname } from 'next/navigation';

import SocialButtons from '@/components/SocialButtons';
import { ROUTES } from '@/constants/routes';
import './header.scss';

interface Props {
  menu: {
    about: string;
    work: string;
    certifications: string;
    contact: string;
  };
}

const Header: React.FC<Props> = ({ menu }) => {
  const { locale } = useParams();
  const path = usePathname();
  const { about, work, certifications, contact } = menu;
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    setOpenMenu(false);
  }, [path]);

  return (
    <header className="header">
      <input
        type="checkbox"
        className="openSidebarMenu"
        id="openSidebarMenu"
        onChange={() => setOpenMenu(!openMenu)}
        checked={openMenu}
      />
      <label htmlFor="openSidebarMenu" className="sidebarIconToggle">
        <div className={'spinner diagonal part-1'}></div>
        <div className={'spinner horizontal'}></div>
        <div className={'spinner diagonal part-2'}></div>
      </label>
      <div id="sidebarMenu">
        <ul className="sidebarMenuInner">
          <li>
            <Link
              href={`/${locale}${ROUTES.home}`}
              passHref
              className={ROUTES.home === path ? 'activePath' : ''}>
              <FaHouse />
            </Link>
          </li>
          <li>
            <Link
              href={`/${locale}${ROUTES.about}`}
              className={ROUTES.about === path ? 'activePath' : ''}>
              {about}
            </Link>
          </li>
          <li>
            <Link
              href={`/${locale}${ROUTES.projects}`}
              className={ROUTES.projects === path ? 'activePath' : ''}>
              {work}
            </Link>
          </li>
          <li>
            <Link
              href={`/${locale}${ROUTES.certifications}`}
              className={ROUTES.certifications === path ? 'activePath' : ''}>
              {certifications}
            </Link>
          </li>
          <li>
            <Link
              href={`/${locale}${ROUTES.contact}`}
              className={ROUTES.contact === path ? 'activePath' : ''}>
              {contact}
            </Link>
          </li>
        </ul>

        <div className="headerSocials">
          {path !== ROUTES.contact && <SocialButtons size={24} />}
        </div>
      </div>
    </header>
  );
};

export default Header;
