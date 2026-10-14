'use client';

import React, { useState } from "react";

interface SignUpProps {
  onSignUp: (username: string, role: string) => void;
}

export default function SignUp({ onSignUp }: SignUpProps) {
  const [username, setUsername]       = useState("");
  const [password, setPassword]       = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage]         = useState("");

  // same as backend
  const STRONG_PW = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!STRONG_PW.test(password)) {
      setMessage("Password must be 8+ chars, include upper, lower, number & special char");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    if (!role) {
      setMessage("Please select a role");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password, confirmPassword, role}),
      });
      const data = await res.json();
      console.log("Signup response:", res.status, data);

      if (res.ok) {
        // Automatically log the user in right after signup
        const loginRes = await fetch("http://localhost:3001/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        });

        if (loginRes.ok) {
          setMessage("✅ " + data.message);
          onSignUp(username, role);
          setUsername(""); setPassword(""); setConfirm(""); setRole("");
        } else {
          setMessage("⚠️ Signup succeeded but auto-login failed.");
        }
      } else {
        setMessage("⚠️ " + data.error);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setMessage("❌ Signup failed: server unreachable.");
    }
  };

  return (
    <div className="signup">
      <h2 className="heading">Sign Up</h2>
      <form onSubmit={handleSubmit} className="form">
        <label className="label">Username:</label>
        <input
          className="input"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />

        <label className="label">Password:</label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <label className="label">Confirm Password:</label>
        <input
          className="input"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirm(e.target.value)}
          required
        />

        <label className="label">Select Role:</label>
        <select className="input" value={role} onChange={e => setRole(e.target.value)} required>
          <option value="">-- Choose a Role --</option>
          <option value="candidate">Candidate</option>
          <option value="lecturer">Lecturer</option>
        </select>

        <button className="button" type="submit">Sign Up</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
