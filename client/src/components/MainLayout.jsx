import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadData } from '../store/appSlice';
import { useAuth } from '../context/AuthContext';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const MainLayout = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  useEffect(() => {
    dispatch(loadData());
  }, [dispatch, user?.id]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
