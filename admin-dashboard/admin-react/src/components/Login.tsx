import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`;

export default function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [login] = useMutation(LOGIN, {
    onCompleted: data => onLogin(data.login),
  });

  return (
    <div>
      <h2>Admin Login</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={() => login({ variables: { username, password } })}>
        Login
      </button>
    </div>
  );
}
