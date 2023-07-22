import Link from 'next/link';
import React from 'react';
import { FaHouse } from 'react-icons/fa6';
import { usePathname } from 'next/navigation';

import { ROUTES } from '@/routes';
import SocialButtons from '../SocialButtons';

const Header = () => {
  const path = usePathname();
  return (
    <header className="header">
      <input type="checkbox" className="openSidebarMenu" id="openSidebarMenu" />
      <label htmlFor="openSidebarMenu" className="sidebarIconToggle">
        <div className="spinner diagonal part-1"></div>
        <div className="spinner horizontal"></div>
        <div className="spinner diagonal part-2"></div>
      </label>
      <div id="sidebarMenu">
        <ul className="sidebarMenuInner">
          <li>
            <Link
              href={ROUTES.home}
              passHref
              className={ROUTES.home === path ? 'active-path' : ''}>
              <FaHouse />
            </Link>
          </li>
          <li>
            <Link
              href={ROUTES.about}
              className={ROUTES.about === path ? 'active-path' : ''}>
              About
            </Link>
          </li>
          <li>
            <Link
              href={ROUTES.projects}
              className={ROUTES.projects === path ? 'active-path' : ''}>
              Work
            </Link>
          </li>
          <li>
            <Link
              href={ROUTES.contact}
              className={ROUTES.contact === path ? 'active-path' : ''}>
              Contact
            </Link>
          </li>
        </ul>

        <div className="header-socials">
          {path !== ROUTES.contact && <SocialButtons size={24} />}
        </div>
      </div>
    </header>
  );
};

export default Header;
