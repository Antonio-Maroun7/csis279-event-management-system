import { useCallback, useEffect, useState } from "react";

/**
 * Loads data with a service function and tracks loading / error.
 *
 * Wrap the function in useCallback: whenever it changes (for example when a
 * filter changes) the data is loaded again and `loading` becomes true.
 *
 * const fetchUsers = useCallback(() => getUsers({ page }), [page]);
 * const { data, loading, error, setError, reload } = useFetch(fetchUsers);
 */
const useFetch = (fetchFn, initialData = null) => {
  // `source` remembers which fetchFn produced the current data
  const [state, setState] = useState({
    source: null,
    data: initialData,
    error: "",
  });

  useEffect(() => {
    let cancelled = false;

    fetchFn()
      .then((data) => {
        if (!cancelled) {
          setState({ source: fetchFn, data, error: "" });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            source: fetchFn,
            error: error.message,
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchFn]);

  // reload without showing the spinner again (keeps the old data on screen)
  const reload = useCallback(async () => {
    try {
      const data = await fetchFn();
      setState({ source: fetchFn, data, error: "" });
    } catch (error) {
      setState((prev) => ({ ...prev, error: error.message }));
    }
  }, [fetchFn]);

  const setError = useCallback((error) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  return {
    data: state.data,
    loading: state.source !== fetchFn,
    error: state.error,
    setError,
    reload,
  };
};

export default useFetch;
