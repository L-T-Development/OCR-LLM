import { useTheme } from "../theme";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button onClick={toggle} className="theme-toggle" title="Toggle theme">
      {theme === "light" ? "⏾" : "☀︎"}
      <style>{`
        .theme-toggle {
          padding: 8px 12px;
          background: var(--toggler);
          color: var(--toggler-text);
          border: none;
          border-radius: 60px;
          cursor: pointer;
          font-size: 1.4rem;
          transition: 0.25s ease;
        }
        .theme-toggle:hover {
          background: "#353a78ff";
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--card-shadow);
        }
      `}</style>
    </button>
  );
}
