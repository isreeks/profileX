use anchor_lang::prelude::*;
use crate::state::user::User;


#[derive(Accounts)]
#[instruction(user_id: String)]

pub struct CreateUser<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 // discriminator
            + 32 // wallet (Pubkey)
            + 4 + 10 // user_id (String, assuming length of 10 bytes)
            + 1 // rank (u8)
            + 8 // token_balance (u64)
            + 144 // skills_space (10 skills, average length of 10 bytes)
            + 144 // portfolio_space (10 portfolio items, average length of 10 bytes)
            + 8, // rewards_earned (u64)
    
    )]
    pub user: Account<'info, User>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_user(ctx: Context<CreateUser>, user_id: String) -> Result<()> {
    let user_account = &mut ctx.accounts.user;
    user_account.wallet = ctx.accounts.authority.key();
    user_account.user_id = user_id;
    user_account.rank = 0;
    user_account.token_balance = 0;
    user_account.skills = vec![];
    user_account.portfolio = vec![];
    user_account.rewards_earned = 0;
    
    Ok(())
}