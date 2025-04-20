#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

// Declare your program's unique ID
declare_id!("CChCHZ73fCThaPfKJKjSJqmHxm9yubpCTEsu6ZmHAe4C");

#[program]
pub mod profile {
    use super::*;

    pub fn create_user(ctx: Context<CreateUser>) -> Result<()> {
        let user = &mut ctx.accounts.user;
        user.authority = ctx.accounts.authority.key();
        user.bump = ctx.bumps.user;
        user.balance = 0;
        user.rank = 0;
        user.skills = Vec::new();
        user.portfolio = Vec::new();
        user.rewards_earned = 0;
        Ok(())
    }

    pub fn update_user_profile(
        ctx: Context<UpdateUserProfile>,
        updated_skills: Vec<String>,
    ) -> Result<()> {
        let user = &mut ctx.accounts.user;
        user.skills = updated_skills;
        Ok(())
    }

    pub fn submit_project(
        ctx: Context<SubmitProject>,
        title: String,
        skills: Vec<String>,
        project_link: String,
    ) -> Result<()> {
        let project = &mut ctx.accounts.project;
        project.owner = ctx.accounts.user.key();
        project.bump = ctx.bumps.project;
        project.title = title;
        project.skills = skills;
        project.project_link = project_link;
        project.submission_time = Clock::get()?.unix_timestamp;
        project.is_validated = false;
        project.scores = Vec::new();
        project.vetters = Vec::new();
        project.final_score = 0;
        Ok(())
    }

    pub fn select_project_to_vet(ctx: Context<SelectProjectToVet>) -> Result<()> {
        let project = &mut ctx.accounts.project;
        let vetter = &ctx.accounts.vetter;
        require!(project.vetters.len() < 3, CustomError::MaxVettersReached);
        require!(!project.vetters.contains(&vetter.key()), CustomError::VetterAlreadyAdded);
        project.vetters.push(vetter.key());
        Ok(())
    }

    pub fn submit_validation(ctx: Context<SubmitValidation>, score: u8) -> Result<()> {
        let project = &mut ctx.accounts.project;
        let vetter_signer = &ctx.accounts.vetter;
        let user_account = &mut ctx.accounts.user;
    
        require!(score <= 100, CustomError::InvalidScore);
        require!(project.vetters.contains(&vetter_signer.key()), CustomError::VetterNotAuthorized);
        require!(
            !project.scores.iter().any(|s| s.vetter == vetter_signer.key()),
            CustomError::VetterAlreadySubmittedScore
        );
    
        project.scores.push(Score {
            vetter: vetter_signer.key(),
            score,
        });
    
        if project.scores.len() == 3 {
            require!(project.vetters.len() == 3, CustomError::InvalidVetterCount);
    
            let total: u16 = project.scores.iter().map(|s| s.score as u16).sum();
            let avg_score = (total / 3) as u8;
    
            // --- Penalty Logic ---
            const DEVIATION_THRESHOLD: u8 = 20;
            const PENALTY_AMOUNT: u64 = 20_000_000_000; // 20 tokens with 9 decimals
            let mut vetters_with_high_deviation: Vec<Pubkey> = Vec::new();
    
            for i in 0..project.scores.len() {
                let current_score_entry = &project.scores[i];
                let mut differences_sum: u16 = 0;
                let mut count = 0;
                for j in 0..project.scores.len() {
                    if i != j {
                        let other_score_entry = &project.scores[j];
                        differences_sum += (current_score_entry.score as i16 - other_score_entry.score as i16).abs() as u16;
                        count += 1;
                    }
                }
                let avg_difference = if count > 0 { (differences_sum / count as u16) as u8 } else { 0 };
                if avg_difference > DEVIATION_THRESHOLD {
                    vetters_with_high_deviation.push(current_score_entry.vetter);
                }
            }
    
            // --- Check Token Account Balance ---
            const REWARD_AMOUNT: u64 = 25_000_000_000; // 25 tokens with 9 decimals
            let required_balance = REWARD_AMOUNT * (project.scores.len() as u64 + 1) + PENALTY_AMOUNT * (vetters_with_high_deviation.len() as u64);
            require!(
                ctx.accounts.token_account.amount >= required_balance,
                CustomError::InsufficientTokenBalance
            );
    
            // --- Penalty Transfer ---
            let authority_seeds = &[&b"authority"[..], &[ctx.bumps.authority]];
            let signer = &[&authority_seeds[..]];
    
            for penalized_vetter_key in &vetters_with_high_deviation {
                msg!("Applying penalty transfer for vetter: {}", penalized_vetter_key);
                let cpi_accounts_penalty = Transfer {
                    from: ctx.accounts.token_account.to_account_info(),
                    to: ctx.accounts.penalty_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                };
                let cpi_context_penalty = CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    cpi_accounts_penalty,
                );
                token::transfer(cpi_context_penalty.with_signer(signer), PENALTY_AMOUNT)?;
            }
    
            // --- Validation and Rewards ---
            const PASSING_SCORE: u8 = 60;
    
            if avg_score >= PASSING_SCORE {
                project.is_validated = true;
    
                // Update user skills (project owner)
                for skill in &project.skills {
                    if !user_account.skills.contains(skill) {
                        user_account.skills.push(skill.clone());
                    }
                }
    
                // Update user rank (project owner only)
                user_account.rank = user_account.rank.saturating_add(1);
    
                // Update user rewards earned (project owner)
                user_account.rewards_earned = user_account.rewards_earned.saturating_add(REWARD_AMOUNT);
    
                // Reward project owner
                let cpi_accounts_owner = Transfer {
                    from: ctx.accounts.token_account.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                };
                let cpi_context_owner = CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    cpi_accounts_owner,
                );
                token::transfer(cpi_context_owner.with_signer(signer), REWARD_AMOUNT)?;
    
                // Reward eligible vetters and update their rewards_earned
                let mut available_vetter_accounts = [
                    (&mut ctx.accounts.vetter_account_1, ctx.accounts.vetter_token_account_1.as_ref()),
                    (&mut ctx.accounts.vetter_account_2, ctx.accounts.vetter_token_account_2.as_ref()),
                    (&mut ctx.accounts.vetter_account_3, ctx.accounts.vetter_token_account_3.as_ref()),
                ];
    
                let mut vetter_map = std::collections::HashMap::new();
                vetter_map.insert(
                    ctx.accounts.vetter_account_1.authority,
                    (&mut ctx.accounts.vetter_account_1, ctx.accounts.vetter_token_account_1.as_ref())
                );
                vetter_map.insert(
                    ctx.accounts.vetter_account_2.authority, 
                    (&mut ctx.accounts.vetter_account_2, ctx.accounts.vetter_token_account_2.as_ref())
                );
                vetter_map.insert(
                    ctx.accounts.vetter_account_3.authority,
                    (&mut ctx.accounts.vetter_account_3, ctx.accounts.vetter_token_account_3.as_ref())
                );
                
                // Then when processing scores, look up directly in the map
                for score_entry in &project.scores {
                    if !vetters_with_high_deviation.contains(&score_entry.vetter) {
                        if let Some((vetter_account, vetter_token_account)) = vetter_map.get_mut(&score_entry.vetter) {
                            // Update vetter's rewards_earned
                            vetter_account.rewards_earned = vetter_account.rewards_earned.saturating_add(REWARD_AMOUNT);
                
                            // Transfer reward to vetter
                            let cpi_accounts_vetter = Transfer {
                                from: ctx.accounts.token_account.to_account_info(),
                                to: vetter_token_account.as_ref().unwrap().to_account_info(),
                                authority: ctx.accounts.authority.to_account_info(),
                            };
                            let cpi_context_vetter = CpiContext::new(
                                ctx.accounts.token_program.to_account_info(),
                                cpi_accounts_vetter,
                            );
                            token::transfer(cpi_context_vetter.with_signer(signer), REWARD_AMOUNT)?;
                        } else {
                            return Err(CustomError::MissingVetterTokenAccount.into());
                        }
                    }
                }
            }
            project.final_score = avg_score;
        }
    
        Ok(())
    }
  
    pub fn fund_reward_pool(ctx: Context<FundRewardPool>, amount: u64) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.source_token_account.to_account_info(),
            to: ctx.accounts.program_token_account.to_account_info(),
            authority: ctx.accounts.source_authority.to_account_info(),
        };
        let cpi_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
        );
        token::transfer(cpi_context, amount)?;
        Ok(())
    }
}

// ----------------------------------
// Accounts Structs
// ----------------------------------

#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + User::INIT_SPACE,
        seeds = [b"user", authority.key().as_ref()],
        bump
    )]
    pub user: Account<'info, User>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateUserProfile<'info> {
    #[account(
        mut,
        seeds = [b"user", authority.key().as_ref()],
        bump = user.bump,
        constraint = user.authority == authority.key() @ CustomError::Unauthorized
    )]
    pub user: Account<'info, User>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(title: String, skills: Vec<String>, project_link: String)]
pub struct SubmitProject<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer = user,
        space = 8 + Project::INIT_SPACE,
        seeds = [b"project", user.key().as_ref(), title.as_bytes()],
        bump
    )]
    pub project: Account<'info, Project>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SelectProjectToVet<'info> {
    #[account(mut)]
    pub project: Account<'info, Project>,
    #[account(mut)]
    pub vetter: Signer<'info>,
}

#[derive(Accounts)]
pub struct SubmitValidation<'info> {
    #[account(
        mut,
        constraint = !project.is_validated @ CustomError::ProjectAlreadyValidated
    )]
    pub project: Account<'info, Project>,

    #[account(mut)]
    pub vetter: Signer<'info>,

    #[account(
        mut,
        seeds = [b"user", project.owner.as_ref()],
        bump = user.bump,
        constraint = user.authority == project.owner @ CustomError::Unauthorized
    )]
    pub user: Account<'info, User>,

    /// CHECK: PDA authority for token transfers
    #[account(seeds = [b"authority"], bump)]
    pub authority: UncheckedAccount<'info>,

    pub token_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = token_account.owner == authority.key() @ CustomError::InvalidTokenAccount,
        token::mint = token_mint
    )]
    pub token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_token_account.owner == project.owner @ CustomError::InvalidTokenAccount,
        token::mint = token_mint
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut, token::mint = token_mint)]
    pub vetter_token_account_1: Option<Account<'info, TokenAccount>>,
    #[account(mut, token::mint = token_mint)]
    pub vetter_token_account_2: Option<Account<'info, TokenAccount>>,
    #[account(mut, token::mint = token_mint)]
    pub vetter_token_account_3: Option<Account<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [b"user", project.vetters[0].as_ref()],
        bump = vetter_account_1.bump,
        constraint = vetter_account_1.authority == project.vetters[0] @ CustomError::InvalidVetterAccount
    )]
    pub vetter_account_1: Account<'info, User>,

    #[account(
        mut,
        seeds = [b"user", project.vetters[1].as_ref()],
        bump = vetter_account_2.bump,
        constraint = vetter_account_2.authority == project.vetters[1] @ CustomError::InvalidVetterAccount
    )]
    pub vetter_account_2: Account<'info, User>,

    #[account(
        mut,
        seeds = [b"user", project.vetters[2].as_ref()],
        bump = vetter_account_3.bump,
        constraint = vetter_account_3.authority == project.vetters[2] @ CustomError::InvalidVetterAccount
    )]
    pub vetter_account_3: Account<'info, User>,

    #[account(mut, token::mint = token_mint)]
    pub penalty_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct FundRewardPool<'info> {
    #[account(
        mut,
        token::mint = token_mint,
        token::authority = authority
    )]
    pub program_token_account: Account<'info, TokenAccount>,

    #[account(constraint = token_mint.key() == program_token_account.mint @ CustomError::InvalidTokenAccount)]
    pub token_mint: Account<'info, Mint>,

    #[account(
        mut,
        token::mint = token_mint,
        token::authority = source_authority
    )]
    pub source_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub source_authority: Signer<'info>,

    #[account(seeds = [b"authority"], bump)]
    /// CHECK: The seeds and bump provide the check for the PDA derivation
    pub authority: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

// ----------------------------------
// Account Data Structs
// ----------------------------------

#[account]
#[derive(InitSpace, PartialEq, Eq)]
pub struct Project {
    #[max_len(32)]
    pub title: String,
    pub owner: Pubkey,
    #[max_len(10, 10)]
    pub skills: Vec<String>,
    #[max_len(128)]
    pub project_link: String,
    pub submission_time: i64,
    #[max_len(3)]
    pub scores: Vec<Score>,
    #[max_len(3)]
    pub vetters: Vec<Pubkey>,
    pub final_score: u8,
    pub is_validated: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct User {
    pub authority: Pubkey,
    pub balance: u64,
    pub rank: u8,
    #[max_len(50, 32)]
    pub skills: Vec<String>,
    #[max_len(50, 32)]
    pub portfolio: Vec<String>,
    pub rewards_earned: u64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Copy, Clone, PartialEq, Eq, InitSpace)]
pub struct Score {
    pub vetter: Pubkey,
    pub score: u8,
}

// ----------------------------------
// Error Codes
// ----------------------------------

#[error_code]
pub enum CustomError {
    #[msg("Insufficient funds for withdrawal")]
    InsufficientFunds,
    #[msg("User already assigned to vetting")]
    VetterAlreadyAdded,
    #[msg("User not assigned to vetting")]
    NotAssigned,
    #[msg("Invalid score")]
    InvalidScore,
    #[msg("Vetter not authorized for this project")]
    VetterNotAuthorized,
    #[msg("Max vetters reached for this project")]
    MaxVettersReached,
    #[msg("Unauthorized operation")]
    Unauthorized,
    #[msg("Invalid token account ownership")]
    InvalidTokenAccount,
    #[msg("Insufficient vetter token accounts provided")]
    InsufficientVetterAccounts,
    #[msg("Project has already been validated")]
    ProjectAlreadyValidated,
    #[msg("Vetter token account not found in context")]
    VetterTokenAccountNotFound,
    #[msg("Vetter has already submitted a score for this project")]
    VetterAlreadySubmittedScore,
    #[msg("Invalid vetter account")]
    InvalidVetterAccount,
    #[msg("Insufficient token balance for rewards or penalties")]
    InsufficientTokenBalance,
    #[msg("Missing vetter token account")]
    MissingVetterTokenAccount,
    #[msg("Invalid number of vetters assigned to project")]
    InvalidVetterCount,
}