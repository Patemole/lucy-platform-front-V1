
import { useState } from "react";

export const useLocalStorage = () => {
  const [value, setValue] = useState(null);

  const setItem = (key, value) => {
    console.log(`Setting localStorage item: ${key} = ${value}`);
    localStorage.setItem(key, value);
    setValue(value);
  };

  const getItem = (key) => {
    const value = localStorage.getItem(key);
    console.log(`Getting localStorage item: ${key} = ${value}`);
    return value;  // Do not set state here
  };

  const removeItem = (key) => {
    console.log(`Removing localStorage item: ${key}`);
    localStorage.removeItem(key);
    setValue(null);
  };

  return { value, setItem, getItem, removeItem };
};