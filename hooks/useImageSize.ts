import { useMemo } from 'react';

export const useImageSize = () => {
  const { width, height } = useMemo(() => {
    if (typeof window !== 'undefined') {
      const { innerWidth, innerHeight } = window ?? {
        innerWidth: 500,
        innerHeight: 300,
      };

      if (innerWidth <= 800) {
        return { width: innerWidth * 0.7, height: innerHeight * 0.3 };
      }

      return { width: innerWidth * 0.8, height: innerHeight * 0.5 };
    }

    return { width: 500, height: 300 };
  }, []);

  return { width, height };
};
