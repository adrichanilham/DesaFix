function PageShell({ eyebrow, title, description }) {
  return (
    <section className="page-panel">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </section>
  );
}

export default PageShell;
