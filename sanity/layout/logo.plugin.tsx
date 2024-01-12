import Logo from '@/components/Logo';
import { definePlugin } from 'sanity';

const logoPlugin = definePlugin({
  name: 'logo-plugin',
  studio: {
    components: {
      logo: () => <Logo size={30} />,
    },
  },
});

export default logoPlugin;
