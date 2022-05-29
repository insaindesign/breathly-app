import AsyncStorage from "@react-native-async-storage/async-storage";

export const persistString = async (key: string, value: string) => {
  return await AsyncStorage.setItem(key, value);
};

export const restoreString = async (key: string, fallback: string) => {
  const value = await AsyncStorage.getItem(key);
  return value != null ? value : fallback;
};

export const persistJson = async (key: string, value: {}) => {
  return await persistString(key, JSON.stringify(value));
};

export const restoreJson = async (key: string, fallback: {}) => {
  const value = await AsyncStorage.getItem(key);
  return value ? JSON.parse(value) : fallback;
};

export const persistNumber = async (key: string, value: number) => {
  return await AsyncStorage.setItem(key, value.toString());
};

export const restoreNumber = async (key: string, fallback: number) => {
  const value = await AsyncStorage.getItem(key);
  return value != null ? Number(value) : fallback;
};

export const persistBoolean = async (key: string, value: boolean) => {
  return await AsyncStorage.setItem(key, value.toString());
};

export const restoreBoolean = async (key: string) => {
  const value = await AsyncStorage.getItem(key);
  return value === "true";
};
