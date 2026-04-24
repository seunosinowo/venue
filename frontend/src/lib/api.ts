const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

export const api = {
  upload: {
    image: async (file: string) => {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ file })
      });
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    }
  },
  auth: {
    login: async (email: string, password: string) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      return res.json();
    },
    register: async (email: string, password: string, name?: string, brand?: string) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, brand })
      });
      if (!res.ok) throw new Error('Registration failed');
      return res.json();
    }
  },
  venues: {
    getAll: async () => {
      const token = getToken();
      const res = await fetch(`${API_URL}/venues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch venues');
      return res.json();
    },
    getPublic: async () => {
      const res = await fetch(`${API_URL}/venues/public`);
      return res.json();
    },
    getBySlug: async (slug: string) => {
      const res = await fetch(`${API_URL}/venues/${slug}`);
      if (!res.ok) throw new Error('Venue not found');
      return res.json();
    },
    create: async (data: any) => {
      const token = getToken();
      const res = await fetch(`${API_URL}/venues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create venue');
      return res.json();
    },
    update: async (id: string, data: any) => {
      const token = getToken();
      const res = await fetch(`${API_URL}/venues/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    delete: async (id: string) => {
      const token = getToken();
      const res = await fetch(`${API_URL}/venues/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.json();
    }
  },
  bookings: {
    getAll: async () => {
      const token = getToken();
      const res = await fetch(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create booking');
      return res.json();
    },
    approve: async (id: string) => {
      const token = getToken();
      const res = await fetch(`${API_URL}/bookings/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.json();
    },
    decline: async (id: string) => {
      const token = getToken();
      const res = await fetch(`${API_URL}/bookings/${id}/decline`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.json();
    }
  },
  settings: {
    get: async () => {
      const token = getToken();
      const res = await fetch(`${API_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.json();
    },
    update: async (data: any) => {
      const token = getToken();
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    updateNotifications: async (data: any) => {
      const token = getToken();
      const res = await fetch(`${API_URL}/settings/notifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      return res.json();
    }
  }
};