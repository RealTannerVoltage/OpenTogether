import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, TextInput, Alert } from 'react-native';
import { useAuth } from '../hooks';
import { UserApi } from '../services/api';

export const SwitchLinkButton: React.FC = () => {
  const { session } = useAuth();
  const [friendCode, setFriendCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLink = async () => {
    if (!friendCode || friendCode.length !== 12) {
      Alert.alert('Error', 'Please enter a valid 12-digit Nintendo Switch Friend Code');
      return;
    }

    if (!session) {
      Alert.alert('Error', 'Please sign in first');
      return;
    }

    try {
      setLoading(true);
      const response = await UserApi.linkSwitchAccount(friendCode, session.token);
      
      if (response.success) {
        Alert.alert('Success', 'Nintendo Switch account linked successfully!');
        setFriendCode('');
      } else {
        Alert.alert('Error', response.error || 'Failed to link account');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to link Nintendo Switch account');
      console.error('Error linking Switch account:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Link Nintendo Switch Account</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Friend Code (12 digits)"
          placeholderTextColor="#888"
          value={friendCode}
          onChangeText={setFriendCode}
          keyboardType="numeric"
          maxLength={12}
          editable={!loading}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleLink}
          disabled={loading || friendCode.length !== 12}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Linking...' : 'Link'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#e62429',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SwitchLinkButton;
