import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Server } from '../types';

interface ServerCardProps {
  server: Server;
  onJoin: (serverId: string) => void;
  joined?: boolean;
}

export const ServerCard: React.FC<ServerCardProps> = ({ server, onJoin, joined }) => {
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{server.name}</Text>
        <Text style={styles.description}>{server.description}</Text>
        <Text style={styles.host}>
          {server.host}:{server.port} | Version: {server.version}
        </Text>
        <Text style={styles.players}>
          Players: {server.players.length}/{server.maxPlayers}
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.joinButton, joined && styles.joinedButton]}
        onPress={() => onJoin(server.id)}
        disabled={joined}
      >
        <Text style={styles.joinText}>
          {joined ? 'Joined' : 'Join Server'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
  },
  host: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  players: {
    color: '#4fc3f7',
    fontSize: 14,
  },
  joinButton: {
    backgroundColor: '#0078d4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 12,
  },
  joinedButton: {
    backgroundColor: '#2e7d32',
  },
  joinText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ServerCard;
