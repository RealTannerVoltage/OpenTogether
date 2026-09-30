import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';

// MSAL Configuration
import { PublicClientApplication } from '@azure/msal-browser';
import { MSAL_CONFIG } from './src/config/auth';

const msalInstance = new PublicClientApplication(MSAL_CONFIG);

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AuthProvider msalInstance={msalInstance}>
          <AppNavigator />
          <StatusBar style="light" />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
