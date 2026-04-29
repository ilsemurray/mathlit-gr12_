import { NavLink } from "react-router-dom";
import { useTracker } from "../../context/TrackerContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/tracker", label: "ATP Tracker", icon: "✅" },
  { to: "/lessons", label: "Lessons", icon: "📖" },
  { to: "/assessments", label: "Assessments", icon: "📝" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const { overallProgress } = useTracker();

  return (
    <aside className="w-64 bg-green-900 text-white flex flex-col h-screen sticky top-0">
      {/* Logo / App Name */}
      <div className="p-5 border-b border-green-700">
        <h1 className="text-lg font-bold leading-tight">ML Grade 12</h1>
        <p className="text-green-300 text-xs mt-1">CAPS Teacher Assistant</p>
      </div>

      {/* Progress Summary */}
      <div className="px-5 py-4 border-b border-green-700">
        <p className="text-xs text-green-300 mb-2">ATP Progress</p>
        <div className="w-full bg-green-800 rounded-full h-2">
          <div
            className="bg-green-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-xs text-green-300 mt-1">{overallProgress}% complete</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                isActive
                  ? "bg-green-700 text-white font-semibold"
                  : "text-green-200 hover:bg-green-800 hover:text-white"
              }`
            }
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-5 border-t border-green-700 text-xs text-green-400">
        <p>Mathematical Literacy</p>
        <p>Grade 12 · CAPS Aligned</p>
      </div>
    </aside>
  );
}
