import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import AppLayout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import Hotels from '../pages/Hotels';
import Rooms from '../pages/Rooms';
import Calendar from '../pages/Calendar';

const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return element;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute element={<AppLayout />} />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'hotels', element: <Hotels /> },
      { path: 'rooms', element: <Rooms /> },
      { path: 'calendar', element: <Calendar /> },
    ],
  },
]);
