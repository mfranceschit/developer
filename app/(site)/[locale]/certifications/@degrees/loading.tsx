import ContentLoader from 'react-content-loader';

const Loading: React.FC = props => (
  <div>
    <ContentLoader
      speed={2}
      width={800}
      height={230}
      viewBox="0 0 800 230"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      {...props}>
      <rect x="-2" y="28" rx="2" ry="2" width="192" height="14" />
      <rect x="0" y="60" rx="2" ry="2" width="160" height="160" />
    </ContentLoader>
  </div>
);

export default Loading;
