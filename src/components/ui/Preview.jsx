import LandingPage from '../landing/LandingPage';
import LivePreview from '../landing/LivePreview';
export default function Preview({ system, large = false, live = false }) {
  if (live && !system.imageUrl) return <LivePreview system={system} />;
  if (system.imageUrl)
    return (
      <div className={`preview preview-image ${large ? 'large' : ''}`}>
        <img
          src={system.imageUrl}
          alt={`Landing page ${system.name}`}
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  return (
    <div
      className={`preview landing-page-preview ${large ? 'large' : ''}`}
      aria-label={`Prévia da landing page ${system.name}`}
    >
      <LandingPage system={system} />
    </div>
  );
}
