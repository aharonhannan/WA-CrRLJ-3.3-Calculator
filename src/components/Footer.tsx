import { STRINGS } from '../strings';

function Footer() {
  return (
    <footer>
      <p className="disclaimer">
        <strong>{STRINGS.disclaimer.title}</strong> {STRINGS.disclaimer.text}
      </p>
      <p className="version">
        {STRINGS.app.version}
        {' | '}
        <a
          href="CLJ_CRRLJ_03_03_00.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="pdf-link"
        >
          {STRINGS.app.pdfLink}
        </a>
      </p>
      <p className="law-note">{STRINGS.app.pdfNote}</p>
    </footer>
  );
}

export default Footer;
