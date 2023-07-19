import Link from 'next/link';
import React from 'react';
import { FaHouse } from 'react-icons/fa6';
import { usePathname } from 'next/navigation';

import { ROUTES } from '@/routes';

const Header = () => {
  const path = usePathname();
  return (
    <header className="header">
      <div className="links">
        <Link
          href={ROUTES.home}
          passHref
          className={ROUTES.home === path ? 'active' : ''}>
          <FaHouse />
        </Link>
        <Link
          href={ROUTES.about}
          className={ROUTES.about === path ? 'active' : ''}>
          About
        </Link>
        <Link
          href={ROUTES.projects}
          className={ROUTES.projects === path ? 'active' : ''}>
          Work
        </Link>
        <Link
          href={ROUTES.contact}
          className={ROUTES.contact === path ? 'active' : ''}>
          Contact
        </Link>
      </div>
    </header>
  );
};

export default Header;
