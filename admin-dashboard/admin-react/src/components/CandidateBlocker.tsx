import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

const GET_CANDIDATES_NONE = gql`
  query GetCandidatesNone {
    candidatesNone { id username blocked }
  }
`;

const BLOCK_CANDIDATE = gql`
  mutation BlockCandidate($candidateId: ID!) {
    blockCandidate(candidateId: $candidateId)
  }
`;

const UNBLOCK_CANDIDATE = gql`
  mutation UnblockCandidate($candidateId: ID!) {
    unblockCandidate(candidateId: $candidateId)
  }
`;

export default function CandidateBlocker({ token }: { token: string }) {
  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery(GET_CANDIDATES_NONE);
  const [blockCandidate, { loading: blocking, error: blockError }] =
    useMutation(BLOCK_CANDIDATE, { onCompleted: () => refetch() });
  const [unblockCandidate, { loading: unblocking, error: unblockError }] =
    useMutation(UNBLOCK_CANDIDATE, { onCompleted: () => refetch() });

  // 1) loading state
  if (loading) {
    return <p>Loading candidates…</p>;
  }
  // 2) error state
  if (error) {
    return <p>Error loading candidates: {error.message}</p>;
  }
  // 3) no-data guard
  const candidates: any[] = data?.candidatesNone || [];
  if (candidates.length === 0) {
    return <p>No candidates to display.</p>;
  }

  return (
    <div>
      <h3>Block / Unblock Candidates</h3>
      <ul>
        {candidates.map(c => (
          <li key={c.id}>
            {c.username} (blocked: {c.blocked.toString()})
            {c.blocked ? (
              <button
                onClick={() => unblockCandidate({ variables: { candidateId: c.id } })}
                disabled={unblocking}
              >
                {unblocking ? 'Unblocking…' : 'Unblock'}
              </button>
            ) : (
              <button
                onClick={() => blockCandidate({ variables: { candidateId: c.id } })}
                disabled={blocking}
              >
                {blocking ? 'Blocking…' : 'Block'}
              </button>
            )}
            {blockError && <span style={{ color: 'red' }}> Error blocking.</span>}
            {unblockError && <span style={{ color: 'red' }}> Error unblocking.</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
