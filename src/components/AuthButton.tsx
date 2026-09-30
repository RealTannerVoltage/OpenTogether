import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks';

interface AuthButtonProps {
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ onSignIn, onSignOut }) => {
  const { isAuthenticated, loading, signInWithMicrosoft, signOut } = useAuth();

  const handlePress = async () => {
    if (isAuthenticated) {
      await signOut();
      onSignOut?.();
    } else {
      await signInWithMicrosoft();
      onSignIn?.();
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#fff" />
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress} disabled={loading}>
      <Text style={styles.text}>
        {isAuthenticated ? 'Sign Out' : 'Sign In with Microsoft'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  button: {
    backgroundColor: '#0078d4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AuthButton;
