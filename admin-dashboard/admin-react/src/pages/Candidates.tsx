import React from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

const GET_CANDIDATES = gql`
  query { candidates { id name blocked } }
`;
const BLOCK = gql`
  mutation BlockCandidate($id: ID!) { blockCandidate(id: $id) { id blocked } }
`;
const UNBLOCK = gql`
  mutation UnblockCandidate($id: ID!) { unblockCandidate(id: $id) { id blocked } }
`;

export default function Candidates() {
  const { data, refetch } = useQuery(GET_CANDIDATES);
  const [blockCandidate] = useMutation(BLOCK);
  const [unblockCandidate] = useMutation(UNBLOCK);

  return (
    <div>
      <h2>Candidates</h2>
      <table>
        <thead><tr><th>Name</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          {data?.candidates.map((c: any) => (
            <tr key={c.id}>
              <td style={{ color: c.blocked ? "grey" : "black" }}>{c.name}</td>
              <td>{c.blocked ? "Blocked" : "Active"}</td>
              <td>
                {c.blocked ? (
                  <button onClick={async () => { await unblockCandidate({ variables: { id: c.id } }); refetch(); }}>
                    Unblock
                  </button>
                ) : (
                  <button onClick={async () => { await blockCandidate({ variables: { id: c.id } }); refetch(); }}>
                    Block
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}