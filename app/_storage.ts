type StorageApi = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function getLocalStorage(): StorageApi | null {
  try {
    const ls = globalThis?.localStorage;
    if (!ls) return null;
    return {
      getItem: (key) => ls.getItem(key),
      setItem: (key, value) => ls.setItem(key, value),
      removeItem: (key) => ls.removeItem(key),
    };
  } catch {
    return null;
  }
}

const memoryStore = new Map<string, string>();

const memoryStorage: StorageApi = {
  getItem: (key) => memoryStore.get(key) ?? null,
  setItem: (key, value) => {
    memoryStore.set(key, value);
  },
  removeItem: (key) => {
    memoryStore.delete(key);
  },
};

export const storage: StorageApi = getLocalStorage() ?? memoryStorage;

