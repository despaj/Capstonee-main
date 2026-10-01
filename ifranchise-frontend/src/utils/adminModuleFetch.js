export async function adminModuleFetch(input, options = {}) {
  const res = await fetch(input, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    console.log("🚪 AUTHENTICATION LOST - REDIRECTING TO LOGIN");

    localStorage.removeItem("user");
    localStorage.removeItem("rememberedUser");

    sessionStorage.removeItem("user");
    sessionStorage.removeItem("tempUser");
    sessionStorage.removeItem("sa_activeModule");
    sessionStorage.removeItem("fa_activeModule");
    sessionStorage.removeItem("fr_activeModule");
    sessionStorage.removeItem("bm_activeModule");

    if (window.location.pathname !== "/admin-login") {
      window.location.replace("/admin-login");
    }
  }

  return res;
}
