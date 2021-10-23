// eslint-disable-next-line no-unused-vars
interface JSON {
  /**
   * safely handles circular references
   * @param obj
   * @param indent
   */
  // eslint-disable-next-line no-unused-vars
  safeStringify(obj: any, indent?: number)
}


JSON.safeStringify = (obj, indent = 2) => {
  let cache = [];
  const retVal = JSON.stringify(
    obj,
    (key, value) =>
      typeof value === "object" && value !== null
        ? cache.includes(value)
          ? undefined // Duplicate reference found, discard key
          : cache.push(value) && value // Store value in our collection
        : value,
    indent
  );
  cache = null;
  return retVal;
};

