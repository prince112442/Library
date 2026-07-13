import useAuth from '../hooks/useAuth';
import StaffDashboard from './StaffDashboard';
import StudentDashboard from './StudentDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  return user?.role === 'student' ? <StudentDashboard /> : <StaffDashboard />;
};

export default Dashboard;
