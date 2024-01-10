'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaHouse } from 'react-icons/fa6';

import SocialButtons from '@/components/SocialButtons';
import { useNavigationRoute } from '@/hooks/useNavigationRoute';
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
  const { routes, currentPath, isContactPage } = useNavigationRoute(menu);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    setOpenMenu(false);
  }, [currentPath]);

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
          {routes.map(({ title, icon, route }, index) => (
            <li key={index}>
              <Link
                href={route}
                passHref
                className={route === currentPath ? 'activePath' : ''}>
                {title}
                {icon && <FaHouse />}
              </Link>
            </li>
          ))}
        </ul>

        <div className="headerSocials">
          {isContactPage && <SocialButtons size={24} />}
        </div>
      </div>
    </header>
  );
};

export default Header;
