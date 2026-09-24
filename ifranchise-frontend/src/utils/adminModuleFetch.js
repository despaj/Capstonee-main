export async function adminModuleFetch(input, options = {}) {
  return fetch(input, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}),
    },
  });
}
