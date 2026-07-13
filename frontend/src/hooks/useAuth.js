import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Convenience hook so components don't need to import useContext + AuthContext separately
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default useAuth;
