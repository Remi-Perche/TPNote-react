import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getDatabase } from '../../db';

const IndexScreen = () => {
  const [db, setDb] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const database = await getDatabase();
      setDb(database);
      await database.execAsync(
        `CREATE TABLE IF NOT EXISTS meals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          totalCalories INTEGER,
          foods TEXT
        );`
      );
      await fetchMeals(database);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (db) {
        fetchMeals(db);
      }
    }, [db])
  );

  const fetchMeals = async (database: any) => {
    try {
      const allRows = await database.getAllAsync('SELECT * FROM meals;');
      setMeals(allRows);
    } catch(e) {
      console.error('Erreur lors du fetch des repas', e);
    }
  };

  const handleMealPress = (mealId: number) => {
    router.push(`/${mealId}`);
  };

  if (!db) {
    return <Text>Chargement...</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Contenu principal */}
      <View style={styles.content}>
        <Text style={styles.title}>Liste des repas</Text>
        <FlatList
          data={meals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => handleMealPress(item.id)}
            >
              <Text style={styles.itemText}>
                {item.name} - {item.totalCalories} Kcal
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun repas enregistré</Text>
          }
        />
        <Button
          title="Ajouter un repas"
          onPress={() => router.push('/add')}
          color="#007AFF"
        />
      </View>

      {/* Barre d'onglets personnalisée */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItemActive}>
          <Text style={styles.tabTextActive}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.replace('/profile')}
        >
          <Text style={styles.tabText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default IndexScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  itemContainer: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 8,
    color: '#999',
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