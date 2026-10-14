'use client';

import React, { useState, useEffect } from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import Profile from "./profile";
import Tutors from "./Tutors";
import Lecturers from "./Lecturers";

// Try to fetch an existing session
const fetchProfile = async () => {
  try {
    const res = await fetch("http://localhost:3001/auth/profile", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Not logged in");
    return await res.json();
  } catch {
    return null;
  }
};

const App: React.FC = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userName, setUserName]     = useState<string | null>(null);
  const [userRole, setUserRole]     = useState<string | null>(null);
  const [view, setView]             = useState("home");

  // on-load check
  useEffect(() => {
    fetchProfile().then(profile => {
      if (profile?.username) {
        setUserName(profile.username);
        setUserRole(profile.role);
        setIsSignedIn(true);
        setView("profile");
      }
    });
  }, []);

  const handleSignIn = (username: string, role: string) => {
    setUserName(username);
    setUserRole(role);
    setIsSignedIn(true);
    setView("profile");
  };

  const handleSignUp = (username: string, role: string) => {
    handleSignIn(username, role);
  };

  const handleSignOut = async () => {
    await fetch("http://localhost:3001/auth/logout", {
      credentials: "include",
    });
    setIsSignedIn(false);
    setUserName(null);
    setUserRole(null);
    setView("signin");
  };

  return (
    <div className="App">
      <header>
        <h1>Teach Team</h1>
        <nav>
          <ul>
            <li>
            <button
              onClick={() => {
                if (isSignedIn) {
                  if (userRole === "lecturer") setView("lecturerDashboard");
                  else setView("tutorApplication");
                } else {
                  setView("home");
                }
              }}
            >
              {isSignedIn
                ? userRole === "lecturer"
                  ? "Lecturer Dashboard"
                  : "Application Form"
                : "Home"}
            </button>
          </li>
            {!isSignedIn ? (
              <>
                <li><button onClick={() => setView("signin")}>Sign In</button></li>
                <li><button onClick={() => setView("signup")}>Sign Up</button></li>
              </>
            ) : (
              <>
                <li><button onClick={() => setView("profile")}>Profile</button></li>
                <li><button onClick={handleSignOut}>Sign Out</button></li>
              </>
            )}
          </ul>
        </nav>
      </header>

      <main className="home-bg">
        {!isSignedIn ? (
          view === "signin" ? (
            <SignIn onSignIn={handleSignIn} />
          ) : view === "signup" ? (
            <SignUp onSignUp={handleSignUp} />
          ) : (
            <div className="home-welcome">
              <h2>Welcome, to <br /> Teach Team Website</h2>
            </div>
          )
        ) : view === "profile" ? (
          <Profile />
        ) : userRole === "lecturer" ? (
          <Lecturers />
        ) : (
          <Tutors />
        )}
      </main>

      <footer className="home-footer">
        <div>
          <p>Developed by:<br />
          Ishaan Vikas and Nima Dehghanpour</p>
        </div>
        <div>
          <p>© 2025 Teach Team. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
