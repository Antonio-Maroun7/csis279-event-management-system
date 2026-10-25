/**
 * Page title block: small eyebrow text, big title, subtitle and optional actions.
 */
const PageHeader = ({ eyebrow, title, subtitle, actions }) => {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="section-actions">{actions}</div>}
    </div>
  );
};

export default PageHeader;
