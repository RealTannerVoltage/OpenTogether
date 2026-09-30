import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { AuthButton, ServerCard, SwitchLinkButton } from '../components';
import { useAuth, useServers } from '../hooks';
import { Server } from '../types';

export const HomeScreen: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { servers, loading, error, fetchServers, joinServer } = useServers();
  const [joinedServers, setJoinedServers] = useState<Set<string>>(new Set());

  const handleJoin = async (serverId: string) => {
    const result = await joinServer(serverId);
    if (result) {
      setJoinedServers(prev => new Set(prev).add(serverId));
    }
  };

  const handleRefresh = async () => {
    await fetchServers();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        <Text style={styles.title}>OpenTogether</Text>
        <Text style={styles.subtitle}>Play Bedrock Together with Nintendo Switch</Text>

        <View style={styles.authContainer}>
          <AuthButton />
        </View>

        {isAuthenticated && user && (
          <View style={styles.userInfo}>
            <Text style={styles.welcome}>Welcome, {user.username}!</Text>
            <SwitchLinkButton />
          </View>
        )}

        <View style={styles.serversHeader}>
          <Text style={styles.sectionTitle}>Available Servers</Text>
          {error && <Text style={styles.error}>{error}</Text>}
        </View>

        {loading && servers.length === 0 ? (
          <ActivityIndicator size="large" color="#4fc3f7" style={styles.loader} />
        ) : (
          servers.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              onJoin={handleJoin}
              joined={joinedServers.has(server.id)}
            />
          ))
        )}

        {servers.length === 0 && !loading && (
          <Text style={styles.empty}>No servers available. Check back later!</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#8892b0',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  authContainer: {
    marginBottom: 20,
  },
  userInfo: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#16213e',
    borderRadius: 12,
  },
  welcome: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  serversHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  error: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 12,
  },
  loader: {
    marginVertical: 20,
  },
  empty: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HomeScreen;
