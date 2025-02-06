import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Keyboard, StyleSheet, Modal, Pressable } from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { EDA_MAN_APP_ID, EDA_MAN_APP_KEY } from '@env';
import { getDatabase } from '../../db';
import useSelectedFoods from "./selectedFoodContext";
import { Ionicons } from '@expo/vector-icons';

const AddMealScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foodResults, setFoodResults] = useState<any[]>([]);
  const [selectedFoodsCollapsed, setSelectedFoodsCollapsed] = useState(true);
  const { addFood, removeFood, updateQuantity, selectedFoods } = useSelectedFoods();
  const router = useRouter();
  const params = useGlobalSearchParams();

  // États pour le Modal de demande du nom du repas
  const [showNameModal, setShowNameModal] = useState(false);
  const [mealName, setMealName] = useState('');

  const searchFood = async () => {
    Keyboard.dismiss();
    try {
      const response = await fetch(
        `https://api.edamam.com/api/food-database/v2/parser?ingr=${encodeURIComponent(
          searchQuery
        )}&app_id=${EDA_MAN_APP_ID}&app_key=${EDA_MAN_APP_KEY}`
      );
      const data = await response.json();
      setFoodResults(data.hints || []);
    } catch (error) {
      console.error('Erreur de recherche', error);
    }
  };

  const insertMeal = async (mealName: string) => {
    const totalCalories = selectedFoods.reduce(
      (total: any, food: any) => total + (food.nutrients?.ENERC_KCAL || 0) * food.quantity,
      0
    );

    const meal = {
      name: mealName,
      totalCalories: totalCalories.toFixed(2),
      foods: selectedFoods,
    };

    try {
      const db = await getDatabase();
      await db.runAsync(
        'INSERT INTO meals (name, totalCalories, foods) VALUES (?, ?, ?);',
        [meal.name, meal.totalCalories, JSON.stringify(meal.foods)]
      );
    } catch (error) {
      console.error('Erreur lors de l’insertion du repas dans la DB', error);
    }
  };

  // Lorsqu'on valide le repas, on affiche le modal pour demander le nom du repas
  const handleValidate = () => {
    if (selectedFoods.length === 0) return;
    setShowNameModal(true);
  };

  // Lorsqu'on confirme le nom dans le modal
  const handleConfirmMealName = async () => {
    await insertMeal(mealName);
    setShowNameModal(false);
    setMealName('');
    router.back();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Ajouter un repas</Text>
      <TextInput
        style={styles.input}
        placeholder="Rechercher un aliment..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search"
        onSubmitEditing={searchFood}
      />
      <TouchableOpacity style={styles.button} onPress={searchFood}>
        <Text style={styles.buttonText}>Rechercher</Text>
      </TouchableOpacity>

      <FlatList
        data={foodResults}
        keyExtractor={(item) => item.food.foodId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => addFood(item.food)}
          >
            <Text style={styles.resultText}>
              {item.food.label} - {item.food.nutrients.ENERC_KCAL.toFixed(2)} Kcal
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun résultat</Text>
        }
      />

      {/* Liste dépliante des aliments sélectionnés */}
      {selectedFoods.length > 0 && (
        <View style={styles.selectedContainer}>
          <TouchableOpacity
            onPress={() =>
              setSelectedFoodsCollapsed(!selectedFoodsCollapsed)
            }
          >
            <Text style={styles.selectedTitle}>
              {selectedFoodsCollapsed
                ? 'Afficher'
                : 'Cacher'}{' '}
              les aliments sélectionnés ({selectedFoods.length})
            </Text>
          </TouchableOpacity>
          {!selectedFoodsCollapsed && (
            <FlatList
              data={selectedFoods}
              keyExtractor={(item) => item.foodId}
              renderItem={({ item }) => (
                <View style={styles.selectedItem}>
                  <Text style={styles.selectedText}>
                    {item.label} - Quantité: {item.quantity}
                  </Text>
                  <View style={styles.selectedActions}>
                    <TouchableOpacity
                      onPress={() =>
                        updateQuantity(item.foodId, item.quantity + 1)
                      }
                    >
                      <Text style={styles.actionText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        updateQuantity(item.foodId, item.quantity - 1)
                      }
                    >
                      <Text style={styles.actionText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeFood(item.foodId)}
                    >
                      <Text style={[styles.actionText, { color: 'red' }]}>
                        Supprimer
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}
      <Pressable style={styles.button} onPress={() => { router.push("/camera") }}>
        <Text style={styles.buttonText}>Ouvrir la caméra</Text>
      </Pressable>
      <TouchableOpacity style={[styles.button, styles.validateButton]} onPress={handleValidate}>
        <Text style={styles.buttonText}>Valider</Text>
      </TouchableOpacity>
      {/* Modal pour demander le nom du repas */}
      <Modal visible={showNameModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nom du repas</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Entrez le nom du repas..."
              value={mealName}
              onChangeText={setMealName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={() => {
                  setShowNameModal(false);
                  setMealName('');
                }}
              >
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.modalButton]}
                onPress={handleConfirmMealName}
              >
                <Text style={styles.buttonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddMealScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#FFF',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  validateButton: {
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  resultItem: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  resultText: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 8,
    color: '#999',
  },
  selectedContainer: {
    marginTop: 16,
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    padding: 8,
  },
  selectedTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    color: '#007AFF',
    textAlign: 'center',
  },
  selectedItem: {
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
  },
  selectedText: {
    fontSize: 16,
    color: '#333',
  },
  selectedActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 3,
  },
  actionText: {
    fontSize: 16,
    color: '#007AFF',
    width: 80,
    textAlign: "center"
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});