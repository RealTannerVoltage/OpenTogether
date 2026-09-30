import { useAuthContext } from '../contexts/AuthContext';
import { AuthContextType } from '../contexts/AuthContext';

// Simple wrapper for backwards compatibility
export const useAuth = (): AuthContextType => {
  return useAuthContext();
};

export default useAuth;
