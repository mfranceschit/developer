import { useMemo } from 'react';

export const useImageSize = () => {
  const { width, height } = useMemo(() => {
    // TODO: Fix the error when window is not defined
    const { innerWidth, innerHeight } = window;

    if (innerWidth <= 800) {
      return { width: innerWidth * 0.7, height: innerHeight * 0.3 };
    }

    return { width: innerWidth * 0.8, height: innerHeight * 0.5 };
  }, []);

  return { width, height };
};
