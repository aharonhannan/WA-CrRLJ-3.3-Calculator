import { useCallback, useRef } from 'react';

let nextId = 0;

export function useDynamicList<T extends { id: number }>(
  items: T[],
  onChange: (items: T[]) => void
) {
  const nextIdRef = useRef(++nextId);

  const addItem = useCallback((defaults: Omit<T, 'id'>) => {
    const newItem = { ...defaults, id: nextIdRef.current++ } as T;
    onChange([...items, newItem]);
  }, [items, onChange]);

  const removeItem = useCallback((id: number) => {
    onChange(items.filter(item => item.id !== id));
  }, [items, onChange]);

  const updateItem = useCallback((id: number, field: keyof T, value: string) => {
    onChange(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  }, [items, onChange]);

  return { addItem, removeItem, updateItem };
}
