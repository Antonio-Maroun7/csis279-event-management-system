import { useEffect, useState } from "react";

/**
 * Returns `value` only after it stopped changing for `delay` ms.
 * Used for search boxes so we do not call the API on every key press.
 */
const useDebounce = (value, delay = 400) => {
  // custom hook for debouncing a value
  const [debounced, setDebounced] = useState(value); // stores the debounced value

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default useDebounce;
