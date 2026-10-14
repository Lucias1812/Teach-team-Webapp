export const signup = async (username: string, password: string) => {
  const res = await fetch('http://localhost:3001/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  return res.json();
};

export const login = async (username: string, password: string) => {
  const res = await fetch('http://localhost:3001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  return res.json();
};

export const logout = async () => {
  const res = await fetch('http://localhost:3001/auth/logout', {
    method: 'GET',
    credentials: 'include',
  });
  return res.json();
};

export const getProfile = async () => {
  const res = await fetch('http://localhost:3001/auth/profile', {
    method: 'GET',
    credentials: 'include',
  });
  return res.json();
};
