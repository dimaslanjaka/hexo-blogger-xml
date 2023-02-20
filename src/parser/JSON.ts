interface JSON {
  [key: string]: any;
  /**
   * safely handles circular references
   * @param obj
   * @param indent
   */
  // eslint-disable-next-line no-unused-vars
  safeStringify(obj: any, indent?: number): string;
}

// @ts-ignore
JSON.safeStringify = (obj, indent = 2) => {
  let cache = [];
  const retVal = JSON.stringify(
    obj,
    (key, value) =>
      typeof value === 'object' && value !== null
        ? cache.includes(value)
          ? undefined // Duplicate reference found, discard key
          : cache.push(value) && value // Store value in our collection
        : value,
    indent
  );
  cache = null;
  return retVal;
};

export function simpleStringify(object) {
  const simpleObject = {};
  for (const prop in object) {
    if (!object.hasOwnProperty(prop)) {
      continue;
    }
    if (typeof object[prop] == 'object') {
      continue;
    }
    if (typeof object[prop] == 'function') {
      continue;
    }
    simpleObject[prop] = object[prop];
  }
  return JSON.stringify(simpleObject, null, 2); // returns cleaned up JSON
}
