import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Data<T> {
  id: string;
  data: T;
}

type Props = {
  children: React.ReactNode;
};

interface DatabaseContextType {
  getData: <T>(id: string) => Promise<T | null>;
  saveData: <T>(data: Data<T>) => Promise<void>;
  deleteData: (id: string) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType>({
  getData: async () => null,
  saveData: async () => {},
  deleteData: async () => {},
});

export const DatabaseProvider = ({ children }: Props) => {
  const [database, setDatabase] = useState<Record<string, unknown>>({});

  useEffect(() => {
    // Load the database from AsyncStorage when the component mounts
    const loadDatabase = async () => {
      try {
        const storedDatabase = await AsyncStorage.getItem("mediaDatabase");
        if (storedDatabase) {
          setDatabase(JSON.parse(storedDatabase));
        }
      } catch (error) {
        console.error("Error loading database:", error);
      }
    };
    loadDatabase();
  }, []);

  const saveDatabase = async <T extends unknown>(
    newDatabase: Record<string, unknown>
  ) => {
    try {
      await AsyncStorage.setItem("mediaDatabase", JSON.stringify(newDatabase));
      setDatabase(newDatabase);
    } catch (error) {
      console.error("Error saving database:", error);
    }
  };
  async function getData<T>(id: string): Promise<T | null> {
    const media = database[id] as unknown | undefined;
    return (media as T) || null;
  }

  async function saveData<T>(data: Data<T>): Promise<void> {
    const newDatabase = { ...database, [data.id]: data.data };
    await saveDatabase(newDatabase);
  }

  const deleteData = async (id: string): Promise<void> => {
    const newDatabase = { ...database };
    delete newDatabase[id];
    await saveDatabase(newDatabase);
  };

  const value = {
    getData,
    saveData,
    deleteData,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType =>
  useContext(DatabaseContext);
// export const useDatabase = () => {
//   const context = useContext(DatabaseContext);
//   if (context === undefined) {
//     throw new Error("useDatabase must be used within a DatabaseProvider");
//   }
//   return context;
// };
