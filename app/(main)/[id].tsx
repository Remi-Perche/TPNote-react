import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDatabase } from '../../db';

const MealDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [db, setDb] = useState<any>(null);
  const [meal, setMeal] = useState<any>(null);
  const [foods, setFoods] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const database = await getDatabase();
      setDb(database);
      await fetchMeal(database);
    })();
  }, []);

  const fetchMeal = async (database: any) => {
    const mealData = await database.getFirstAsync(
        'SELECT * FROM meals WHERE id = ?;',
        id
    );
    setMeal(mealData);
    setFoods(JSON.parse(mealData.foods || '[]'))
  };

  const handleDeleteMeal = async () => {
    await db.runAsync(
        'DELETE FROM meals WHERE id = ?;',
        id
    );
    router.back();
  };

  if (!db || !meal) {
    return <Text style={styles.loadingText}>Chargement...</Text>;
  }

  const totalMealCalories = foods.reduce(
    (total, food) => total + (food.nutrients?.ENERC_KCAL || 0) * food.quantity,
    0
  ).toFixed(2);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détail du repas</Text>
      <Text style={styles.subtitle}>Nom : {meal.name}</Text>
      <Text style={styles.subtitle}>Total Calories : {totalMealCalories} Kcal</Text>
      <Text style={styles.sectionTitle}>Aliments :</Text>
      <FlatList
        data={foods}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.foodItem}>
            <Text style={styles.foodText}>{item.label}</Text>
            <Text style={styles.foodText}>Quantité : {item.quantity}</Text>
            <Text style={styles.foodText}>
              Calories : {item.nutrients?.ENERC_KCAL.toFixed(2) || 'N/A'} Kcal
            </Text>
            <Text style={styles.foodText}>
              Protéines : {item.nutrients?.PROCNT.toFixed(2) || 'N/A'} g
            </Text>
            <Text style={styles.foodText}>
              Glucides : {item.nutrients?.CHOCDF.toFixed(2) || 'N/A'} g
            </Text>
            <Text style={styles.foodText}>
              Lipides : {item.nutrients?.FAT.toFixed(2) || 'N/A'} g
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun aliment enregistré</Text>}
      />
      <Button title="Supprimer ce repas" onPress={handleDeleteMeal} color="#FF3B30" />
    </View>
  );
};

export default MealDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
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
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginVertical: 4,
    color: '#555',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  foodItem: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  foodText: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 8,
  },
});
