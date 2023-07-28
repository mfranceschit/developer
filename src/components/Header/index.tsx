import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaHouse } from 'react-icons/fa6';
import { usePathname } from 'next/navigation';

import { ROUTES } from '@/routes';
import SocialButtons from '../SocialButtons';
import { useLanguage } from '@/hooks/useLanguage';

const Header = () => {
  const path = usePathname();
  const {
    content: { menu },
  } = useLanguage();
  const { about, work, contact } = menu;
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
              {about}
            </Link>
          </li>
          <li>
            <Link
              href={ROUTES.projects}
              className={ROUTES.projects === path ? 'active-path' : ''}>
              {work}
            </Link>
          </li>
          <li>
            <Link
              href={ROUTES.contact}
              className={ROUTES.contact === path ? 'active-path' : ''}>
              {contact}
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
