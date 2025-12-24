export const authFetch = async (url, options = {}) => {
  const res = await fetch(url, options);

  if (res.status === 401) {
    toast.error("Session expired. Please login again.");
    window.location.href = "/login";
    return null;
  }

  return res;
};

