// errors.rs
use anchor_lang::prelude::*;

#[error_code]
pub enum ProgramError {
    #[msg("User already exists.")]
    UserAlreadyExists,
    #[msg("Vetting is not allowed for this rank.")]
    VettingNotAllowed,
    #[msg("Insufficient tokens for reward.")]
    InsufficientTokens,
}