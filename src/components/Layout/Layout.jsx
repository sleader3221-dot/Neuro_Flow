import { Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from '../ui/Toast';

export default function Layout() {
  const { state } = useApp();
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-content page-enter">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
}
