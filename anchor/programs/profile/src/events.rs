// events.rs
use anchor_lang::prelude::*;

#[event]
pub struct UserCreated {
    pub wallet: Pubkey,
    pub username: String,
}

#[event]
pub struct ProjectVetted {
    pub project_id: u32,
    pub vetter: Pubkey,
    pub vetted_user: Pubkey,
    pub success: bool,
}