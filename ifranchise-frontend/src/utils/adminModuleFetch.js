let refreshPromise = null;

export async function adminModuleFetch(input, options = {}) {
  const requestOptions = {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}),
    },
  };

  // First request
  let response = await fetch(input, requestOptions);

  // Access token is still valid
  if (response.status !== 401) {
    return response;
  }

  // Access token expired.
  // Only allow ONE refresh request at a time.
  if (!refreshPromise) {
    refreshPromise = fetch(`${process.env.REACT_APP_API_URL}/refresh-token`, {
      method: "POST",
      credentials: "include",
    }).finally(() => {
      refreshPromise = null;
    });
  }

  const refreshResponse = await refreshPromise;

  // Refresh token is also invalid/expired
  if (!refreshResponse.ok) {
    return response;
  }

  // New access token was issued.
  // Retry the original request.
  return fetch(input, requestOptions);
}
