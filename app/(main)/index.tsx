// app/(main)/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getDatabase } from '../../db';

const IndexScreen = () => {
  const [db, setDb] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const database = await getDatabase();
      setDb(database);
      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS meals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            totalCalories INTEGER,
            foods TEXT
          );`
        );
      fetchMeals(database);
    })();
  }, []);

  const fetchMeals = async (database: any) => {
    try {
      const allRows = await db.getAllAsync('SELECT * FROM meals;');
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
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 16 }}>Liste des repas</Text>
      <FlatList
        data={meals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleMealPress(item.id)}>
            <Text style={{ fontSize: 16, marginVertical: 8 }}>
              {item.name} - {item.totalCalories} Kcal
            </Text>
          </TouchableOpacity>
        )}
      />
      <Button title="Ajouter un repas" onPress={() => router.push('/add')} />
    </View>
  );
};

export default IndexScreen;