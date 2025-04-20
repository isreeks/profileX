// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import ProfileIDL from '../target/idl/profile.json';
import type { Profile } from '../target/types/profile';

// Re-export the generated IDL and type
export { Profile, ProfileIDL };

// The programId is imported from the program IDL.
export const PROFILE_PROGRAM_ID = new PublicKey(ProfileIDL.address);

// This is a helper function to get the Profile Anchor program.
export function getProfileProgram(provider: AnchorProvider) {
  return new Program(ProfileIDL as Profile, provider);
}

// This is a helper function to get the program ID for the Profile program depending on the cluster.
export function getProfileProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return PROFILE_PROGRAM_ID;
  }
}
