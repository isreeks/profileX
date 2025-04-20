use anchor_lang::prelude::*;

#[account]
pub struct User {
    pub wallet: Pubkey, // The wallet address of the user
    pub user_id: String, // The user's chosen username
    pub rank: u8, // The user's rank in the system
    pub token_balance: u64, // The user's token balance
    pub skills: Vec<String>, // A list of the user's skills
    pub portfolio: Vec<String>, // A list of the user's projects or portfolio items
    pub rewards_earned: u64, // Rewards earned by the user
}