
import { Wind } from "lucide-react";

export default function Header() {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-icon">
          <Wind size={25} />
        </div>
        <div>
          <h1>WindSight</h1>
          <p>Wind generation intelligence</p>
        </div>
      </div>

      <div className="header-tag">
        <span className="status-dot" />
        Historical analysis
      </div>
    </header>
  );
}
