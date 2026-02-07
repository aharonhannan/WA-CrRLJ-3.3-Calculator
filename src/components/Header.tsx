import { STRINGS } from '../strings';

function Header() {
  return (
    <header>
      <h1>{STRINGS.app.title}</h1>
      <p className="subtitle">{STRINGS.app.subtitle}</p>
    </header>
  );
}

export default Header;
