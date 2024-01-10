import { ROUTES } from '@/constants/routes';
import { useParams, usePathname } from 'next/navigation';

interface UseNavigationRouteProps {
  about: string;
  work: string;
  certifications: string;
  contact: string;
}

export const useNavigationRoute = ({
  about,
  work,
  certifications,
  contact,
}: UseNavigationRouteProps) => {
  const { locale } = useParams();
  const currentPath = usePathname();

  const contactPath = `/${locale}${ROUTES.contact}`;
  const isContactPage = currentPath === contactPath;

  const routes = [
    {
      title: '',
      icon: true,
      route: `/${locale}`,
    },
    {
      title: about,
      route: `/${locale}${ROUTES.about}`,
    },
    {
      title: work,
      route: `/${locale}${ROUTES.projects}`,
    },
    {
      title: certifications,
      route: `/${locale}${ROUTES.certifications}`,
    },
    {
      title: contact,
      route: contactPath,
    },
  ];

  return { currentPath, isContactPage, routes };
};
