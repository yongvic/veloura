export default function Loading() {
  return (
    <div className="page-frame" aria-busy="true" aria-label="Chargement de la page">
      <div className="loading-stack">
        <div className="skeleton skeleton-banner" />
        <div className="skeleton-grid">
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
        </div>
      </div>
    </div>
  );
}
