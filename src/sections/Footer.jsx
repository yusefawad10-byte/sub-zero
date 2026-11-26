import { brand, footer } from '../content';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div className="footer-brand">
          <Logo size={40} />
          <div>
            <strong>{brand.name}</strong>
            <p>{footer.line}</p>
          </div>
        </div>
        <nav className="footer-links" aria-label="Social">
          {footer.links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer">
              {l.label}
            </a>
          ))}
        </nav>
        <p className="small">{footer.small}</p>
      </div>
    </footer>
  );
}
