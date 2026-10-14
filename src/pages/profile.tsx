'use client';

import React, { useEffect, useState } from 'react';

interface ProfileData {
  username: string;
  role: string;
  joinDate: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/auth/profile', {
      credentials: 'include',
    })
      .then(async res => {
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Not logged in or session expired");
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    await fetch('http://localhost:3001/auth/logout', {
      credentials: 'include',
    });
    window.location.href = '/';
  };

  if (loading) return <p className="status-message">Loading profile...</p>;
  if (error)   return <p className="error">{error}</p>;
  if (!profile) return <p className="status-message">Profile data not available.</p>;

  return (
    <div className="profile">
      <h2 className="heading">Welcome, {profile.username}</h2>
      <p><strong>Role:</strong> {profile.role}</p>
      <p><strong>Joined:</strong> {new Date(profile.joinDate).toLocaleString()}</p>
      <button className="button" onClick={handleLogout}>Log Out</button>
    </div>
  );
}
