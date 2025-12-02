export const getToken = () => localStorage.getItem('token');
export const setToken = (token: string) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

const headers = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  get: async (url: string) => {
    const res = await fetch(`/api${url}`, { headers: headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  post: async (url: string, body: any) => {
    const res = await fetch(`/api${url}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  },
  put: async (url: string, body: any) => {
    const res = await fetch(`/api${url}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  },
  delete: async (url: string) => {
    const res = await fetch(`/api${url}`, {
      method: 'DELETE',
      headers: headers(),
    });
    if (!res.ok) throw new Error(await res.text());
    const text = await res.text();
    return text ? JSON.parse(text) : {}; // Backend might return empty body or object
  }
};
