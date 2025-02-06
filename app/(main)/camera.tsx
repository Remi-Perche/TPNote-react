import React, { useState, useRef, useEffect, useContext } from "react";
import { StyleSheet, View, Text, Button, Pressable, Modal, Alert, TouchableOpacity } from "react-native";
import { Camera, CameraView, useCameraPermissions } from "expo-camera";
import { EDA_MAN_APP_ID, EDA_MAN_APP_KEY } from '@env';
import { router, useGlobalSearchParams } from "expo-router";
import useSelectedFoods from "./selectedFoodContext";
import { Ionicons } from "@expo/vector-icons";

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [foodData, setFoodData] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { addFood } = useSelectedFoods();

  useEffect(() => {
    (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === false) {
    return <Text>Pas d'autorisation pour la caméra</Text>;
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    try {
      const response = await fetch(
        `https://api.edamam.com/api/food-database/v2/parser?upc=${encodeURIComponent(
          data
        )}&app_id=${EDA_MAN_APP_ID}&app_key=${EDA_MAN_APP_KEY}`
      );
      const foodData = await response.json();
      setFoodData(foodData.hints[0]);
      setModalVisible(true);
    } catch (error) {
      console.error("Erreur API Edamam :", error);
      Alert.alert("Erreur", "Impossible de récupérer les informations de l'aliment.");
      setScanned(false);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setScanned(false);
  };

  const handleAddFood = () => {
    setModalVisible(false);
    setScanned(false);
    if (foodData) {
      const food = foodData.food;
      if (food) {
        addFood(food);
        Alert.alert("Succès", "Aliment ajouté !");
        router.back();
      }
    }
  };

  return (
    <View style={styles.container}>
      {!scanned && (
        <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      )}
      {foodData && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={handleCancel}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.foodLabel}>{foodData.food.label}</Text>
              <Text>Catégorie : {foodData.food.category}</Text>
              <Text>Marque : {foodData.food.brand || "N/A"}</Text>
              <Text>Calories : {foodData.food.nutrients.ENERC_KCAL || "N/A"} kcal</Text>
              <View style={styles.buttonContainer}>
                <Button title="Annuler" onPress={handleCancel} color="red" />
                <Button title="Ajouter" onPress={handleAddFood} color="green" />
              </View>
            </View>
          </View>
        </Modal>
      )}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={50} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: 'absolute',
    bottom: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  foodLabel: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    width: "100%",
  },
});