import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Nutrients {
  ENERC_KCAL: number;
  PROCNT: number;
  CHOCDF: number;
  FAT: number;
}

interface Food {
  foodId: string;
  label: string;
  nutrients: Nutrients;
  quantity: number;
}

interface SelectedFoodsContextType {
  selectedFoods: Food[];
  addFood: (food: Food) => void;
  removeFood: (foodId: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
}

const SelectedFoodsContext = createContext<SelectedFoodsContextType | undefined>(undefined);

export const SelectedFoodsProvider = ({ children }: { children: ReactNode }) => {
  const [selectedFoods, setSelectedFoods] = useState<Food[]>([]);

  const addFood = (food: Food) => {
    setSelectedFoods(prevFoods => {
      const existing = prevFoods.find(item => item.foodId === food.foodId);
      if (existing) {
        return prevFoods.map(item =>
          item.foodId === food.foodId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevFoods, { ...food, quantity: 1 }];
    });
  };

  const removeFood = (foodId: string) => {
    setSelectedFoods(prevFoods => prevFoods.filter(item => item.foodId !== foodId));
  };

  const updateQuantity = (foodId: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedFoods(prevFoods =>
      prevFoods.map(item =>
        item.foodId === foodId ? { ...item, quantity } : item
      )
    );
  };

  return (
    <SelectedFoodsContext.Provider value={{ selectedFoods, addFood, removeFood, updateQuantity }}>
      {children}
    </SelectedFoodsContext.Provider>
  );
};

export default function useSelectedFoods() {
  const context = useContext(SelectedFoodsContext);
  if (!context) {
    throw new Error('useSelectedFoods must be used within a SelectedFoodsProvider');
  }
  return context;
};