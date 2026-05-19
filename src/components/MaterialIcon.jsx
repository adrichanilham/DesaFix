function MaterialIcon({ name, size = 'md', filled = false, className = '', title }) {
  const classes = [
    'material-symbols-rounded',
    `icon-${size}`,
    filled ? 'icon-filled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const accessibilityProps = title
    ? { 'aria-label': title, role: 'img' }
    : { 'aria-hidden': 'true' };

  return (
    <span className={classes} title={title} {...accessibilityProps}>
      {name}
    </span>
  );
}

export default MaterialIcon;
