import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";

const LOGIN_MUTATION = gql`
  mutation AdminLogin($username: String!, $password: String!) {
    adminLogin(username: $username, password: $password)
  }
`;

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const history = useHistory();
  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const { data } = await loginMutation({
        variables: { username, password },
      });

      if (data && data.adminLogin) {
        login(data.adminLogin); // token or success flag
        history.push("/courses");
      } else {
        setErrorMsg("Login failed: No response from server.");
      }
    } catch (error) {
      console.error("Login error", error);
      setErrorMsg("Invalid username or password.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Login</button>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
    </form>
  );
}
