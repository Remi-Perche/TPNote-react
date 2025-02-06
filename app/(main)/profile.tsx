// app/(main)/profile.tsx
import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

const ProfileScreen = () => {
  const { user } = useUser();
  const { signOut } = useClerk()
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <View style={styles.container}>
        <View style={styles.content}>
            <Text style={styles.title}>Profil</Text>
            <Text style={styles.info}>Email : {user?.primaryEmailAddress?.emailAddress}</Text>
            <Button title="Se déconnecter" onPress={handleSignOut} color="#FF3B30" />
        </View>
      {/* Barre d'onglets personnalisée */}
        <View style={styles.tabBar}>
            <TouchableOpacity style={styles.tabItem} onPress={() => router.replace('/')}>
                <Text style={styles.tabText}>Accueil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItemActive}>
                <Text style={styles.tabTextActive}>Profil</Text>
            </TouchableOpacity>
        </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: "space-between"
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  info: {
    fontSize: 18,
    marginBottom: 24,
    color: '#555',
    textAlign: 'center',
  },
  // Styles de la barre d'onglets
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    backgroundColor: '#F5F5F5',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabItemActive: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#999',
  },
  tabTextActive: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});