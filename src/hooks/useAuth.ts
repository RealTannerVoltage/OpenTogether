import { AuthContextType, useAuthContext } from '../contexts/AuthContext';

// Legacy hook - use useAuthContext instead
// Keeping for backwards compatibility
export const useAuth = (): AuthContextType => {
  return useAuthContext();
};

export default useAuth;
