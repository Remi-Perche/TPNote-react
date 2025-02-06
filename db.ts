// db.ts
import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

export const getDatabase = async () => {
    return await SQLite.openDatabaseAsync('meals.db');
};
