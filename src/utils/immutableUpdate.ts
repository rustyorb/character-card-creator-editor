/**
 * Performs an immutable update on a nested object.
 * Creates a deep copy of the object and sets a value at a given path.
 * @param obj The original object.
 * @param path A dot-separated string representing the path to the value (e.g., 'data.name').
 * @param value The new value to set at the path.
 * @returns A new object with the updated value.
 */
export const setIn = (obj: any, path: string, value: any): any => {
  // A simple deep clone is sufficient and safe for serializable JSON objects.
  const newObj = JSON.parse(JSON.stringify(obj));
  
  const pathArray = path.split('.');
  let current = newObj;

  // Traverse the path to the second-to-last element
  for (let i = 0; i < pathArray.length - 1; i++) {
    const key = pathArray[i];
    // Create nested objects if they don't exist during traversal
    if (current[key] === undefined || typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }

  // Set the value on the final key
  current[pathArray[pathArray.length - 1]] = value;

  return newObj;
};
