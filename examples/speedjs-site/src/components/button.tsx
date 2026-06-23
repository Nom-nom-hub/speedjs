export function Button({ variant = 'primary', size, href, target, onClick, children, ...props }: {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'lg';
  href?: string;
  target?: string;
  onClick?: (e: any) => void;
  children: any;
  [key: string]: any;
}) {
  const cls = `btn btn-${variant}${size ? ' btn-' + size : ''}`
  if (href) {
    return <a href={href} target={target} class={cls} onClick={onClick} {...props}>{children}</a>
  }
  return <button class={cls} onClick={onClick} {...props}>{children}</button>
}
