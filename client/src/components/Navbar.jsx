import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './Button';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-indigo-600 text-white'
      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
  }`;

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
          NhàTrọ PTIT
        </Link>

        {/* Menu desktop */}
        <nav aria-label="Điều hướng chính" className="hidden items-center gap-2 md:flex">
          <NavLink to="/" end className={linkClass}>
            Phòng trống
          </NavLink>

          {user?.role === 'landlord' && (
            <>
              <NavLink to="/landlord" className={linkClass}>
                Quản lý trọ
              </NavLink>
              <NavLink to="/landlord/billing" className={linkClass}>
                Hóa đơn & Điện nước
              </NavLink>
            </>
          )}

          {user?.role === 'tenant' && (
            <NavLink to="/tenant" className={linkClass}>
              Phòng của tôi
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {darkMode ? 'Sáng' : 'Tối'}
          </button>

          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-xs text-slate-600 dark:text-slate-300">
                {`${user.name} (${user.role})`}
              </span>
              <Button variant="secondary" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button>Đăng nhập</Button>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Mở menu"
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <nav
          aria-label="Điều hướng di động"
          className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 dark:border-slate-800 md:hidden"
        >
          <NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>
            Phòng trống
          </NavLink>
          {user?.role === 'landlord' && (
            <>
              <NavLink to="/landlord" className={linkClass} onClick={() => setMenuOpen(false)}>
                Quản lý trọ
              </NavLink>
              <NavLink
                to="/landlord/billing"
                className={linkClass}
                onClick={() => setMenuOpen(false)}
              >
                Hóa đơn & Điện nước
              </NavLink>
            </>
          )}
          {user?.role === 'tenant' && (
            <NavLink to="/tenant" className={linkClass} onClick={() => setMenuOpen(false)}>
              Phòng của tôi
            </NavLink>
          )}
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 rounded-lg bg-rose-50 px-3 py-2 text-left text-sm font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
            >
              Đăng xuất
            </button>
          )}
        </nav>
      )}
    </header>
  );
};
export default Navbar;