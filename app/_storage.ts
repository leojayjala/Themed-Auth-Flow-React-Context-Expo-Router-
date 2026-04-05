import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type StorageApi = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

function getWebStorage(): StorageApi | null {
  if (Platform.OS !== "web") return null;
  try {
    const ls = globalThis?.localStorage;
    if (!ls) return null;
    return {
      getItem: async (key) => ls.getItem(key),
      setItem: async (key, value) => {
        ls.setItem(key, value);
      },
      removeItem: async (key) => {
        ls.removeItem(key);
      },
    };
  } catch {
    return null;
  }
}

function getNativeAsyncStorage(): StorageApi | null {
  if (Platform.OS === "web") return null;
  try {
    if (!AsyncStorage?.getItem) return null;
    return {
      getItem: (key) => AsyncStorage.getItem(key),
      setItem: (key, value) => AsyncStorage.setItem(key, value),
      removeItem: (key) => AsyncStorage.removeItem(key),
    };
  } catch {
    return null;
  }
}

const memoryStore = new Map<string, string>();

const memoryStorage: StorageApi = {
  getItem: async (key) => memoryStore.get(key) ?? null,
  setItem: async (key, value) => {
    memoryStore.set(key, value);
  },
  removeItem: async (key) => {
    memoryStore.delete(key);
  },
};

export const storage: StorageApi = getWebStorage() ?? getNativeAsyncStorage() ?? memoryStorage;

