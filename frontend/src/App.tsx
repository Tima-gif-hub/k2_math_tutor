import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/solve", label: "Solve" },
  { to: "/explain", label: "Explain" },
  { to: "/sandbox", label: "Sandbox" }
];

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold text-primary">K2 Math Tutor</h1>
            <p className="text-sm text-slate-400">
              Step-by-step math guidance with SymPy validation.
            </p>
          </div>
          <nav className="flex gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "rounded-lg px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-primary text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
