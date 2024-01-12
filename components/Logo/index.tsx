import Image from 'next/image';

const Logo = ({ size = 200 }: { size?: number }) => {
  return <Image alt="Logo" width={size} height={size} src="/images/logo.png" />;
};

export default Logo;
