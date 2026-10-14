'use client';

import React, { useState } from "react";

interface SignInProps {
  onSignIn: (username: string, role: string) => void;
}

export default function SignIn({ onSignIn }: SignInProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      console.log("Login response:", res.status, data);

      if (res.ok) {
        // now fetch profile to get role
        const pr = await fetch("http://localhost:3001/auth/profile", {
          credentials: "include",
        });
        const prof = await pr.json();
        onSignIn(username, prof.role);
      } else {
        setMessage(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("❌ Login failed: server unreachable.");
    }
  };

  return (
    <div className="signin">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <label>Username:</label>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button type="submit">Sign In</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
