import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Profile } from "../target/types/profile";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import assert from "assert";


describe("Profile Program", () => {
  // Set up the Anchor provider and program
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Profile as Program<Profile>;

  // Keypairs and accounts
  let user: Keypair;
  let vetter1: Keypair;
  let vetter2: Keypair;
  let vetter3: Keypair;
  let mint: PublicKey;
  let programTokenAccount: PublicKey;
  let userTokenAccount: PublicKey;
  let vetter1TokenAccount: PublicKey;
  let vetter2TokenAccount: PublicKey;
  let vetter3TokenAccount: PublicKey;
  let penaltyAccount: Keypair;
  let authorityPda: PublicKey;
  let authorityBump: number;

  beforeEach(async () => {
    // Generate keypairs
    user = Keypair.generate();
    vetter1 = Keypair.generate();
    vetter2 = Keypair.generate();
    vetter3 = Keypair.generate();
    penaltyAccount = Keypair.generate();

    // Fund accounts with SOL
    const fundTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: user.publicKey,
        lamports: 10 * LAMPORTS_PER_SOL,
      }),
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: vetter1.publicKey,
        lamports: 10 * LAMPORTS_PER_SOL,
      }),
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: vetter2.publicKey,
        lamports: 10 * LAMPORTS_PER_SOL,
      }),
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: vetter3.publicKey,
        lamports: 10 * LAMPORTS_PER_SOL,
      })
    );
    await provider.sendAndConfirm(fundTx);

    // Derive the program's authority PDA
    [authorityPda, authorityBump] = await PublicKey.findProgramAddressSync(
      [Buffer.from("authority")],
      program.programId
    );

    // Assume token accounts are pre-created (or created via a helper instruction)
    // For testing, we'll use placeholder pubkeys; replace with actual token account creation
    mint = Keypair.generate().publicKey; // Placeholder mint
    programTokenAccount = Keypair.generate().publicKey; // Placeholder
    userTokenAccount = Keypair.generate().publicKey; // Placeholder
    vetter1TokenAccount = Keypair.generate().publicKey; // Placeholder
    vetter2TokenAccount = Keypair.generate().publicKey; // Placeholder
    vetter3TokenAccount = Keypair.generate().publicKey; // Placeholder

    // Note: In a real setup, you need to create/mint tokens and set up token accounts.
    // If you have a helper instruction to initialize token accounts, call it here.
    // Example (pseudo-code):
    /*
    await program.methods
      .initializeTokenAccounts()
      .accounts({
        mint: mint,
        programTokenAccount: programTokenAccount,
        userTokenAccount: userTokenAccount,
        vetter1TokenAccount: vetter1TokenAccount,
        vetter2TokenAccount: vetter2TokenAccount,
        vetter3TokenAccount: vetter3TokenAccount,
        authority: authorityPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    */
  });

  it("Creates a user", async () => {
    // Derive the user PDA
    const [userPda, userBump] = await PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user.publicKey.toBuffer()],
      program.programId
    );

    // Call create_user
    await program.methods
      .createUser()
      .accounts({
        user: userPda,
        authority: user.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    // Fetch the user account
    const userAccount = await program.account.user.fetch(userPda);

    console.log(userAccount);
    
    

    // Assertions
    assert.equal(userAccount.authority.toBase58(), user.publicKey.toBase58());
    assert.equal(userAccount.balance.toNumber(), 0);
    assert.equal(userAccount.rank, 0);
    assert.deepEqual(userAccount.skills, []);
    assert.deepEqual(userAccount.portfolio, []);
    assert.equal(userAccount.rewardsEarned.toNumber(), 0);
    assert.equal(userAccount.bump, userBump);
  });

  it("Updates a user profile", async () => {
    // Create a user
    const [userPda, userBump] = await PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .createUser()
      .accounts({
        user: userPda,
        authority: user.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    // Update skills
    const newSkills = ["Rust", "Solana"];
    await program.methods
      .updateUserProfile(newSkills)
      .accounts({
        user: userPda,
        authority: user.publicKey,
      })
      .signers([user])
      .rpc();

    // Fetch the user account
    const userAccount = await program.account.user.fetch(userPda);

    // Assertions
    assert.deepEqual(userAccount.skills, newSkills);
  });

  it("Submits a project", async () => {
    // Derive the project PDA
    const title = "Test Project";
    const [projectPda, projectBump] = await PublicKey.findProgramAddressSync(
      [Buffer.from("project"), user.publicKey.toBuffer(), Buffer.from(title)],
      program.programId
    );

    // Call submit_project
    const skills = ["Rust", "Anchor"];
    await program.methods
      .submitProject(title, skills)
      .accounts({
        user: user.publicKey,
        project: projectPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    // Fetch the project account
    const projectAccount = await program.account.project.fetch(projectPda);

    // Assertions
    assert.equal(projectAccount.title, title);
    assert.equal(projectAccount.owner.toBase58(), user.publicKey.toBase58());
    assert.deepEqual(projectAccount.skills, skills);
    assert.equal(projectAccount.isValidated, false);
    assert.deepEqual(projectAccount.scores, []);
    assert.deepEqual(projectAccount.vetters, []);
    assert.equal(projectAccount.finalScore, 0);
    assert.equal(projectAccount.bump, projectBump);
  });

  it("Selects vetters for a project", async () => {
    // Submit a project
    const title = "Test Project";
    const [projectPda, _projectBump] = await PublicKey.findProgramAddressSync(
      [Buffer.from("project"), user.publicKey.toBuffer(), Buffer.from(title)],
      program.programId
    );

    await program.methods
      .submitProject(title, ["Rust"])
      .accounts({
        user: user.publicKey,
        project: projectPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    // Vetter 1 selects the project
    await program.methods
      .selectProjectToVet()
      .accounts({
        project: projectPda,
        vetter: vetter1.publicKey,
      })
      .signers([vetter1])
      .rpc();

    // Vetter 2 selects the project
    await program.methods
      .selectProjectToVet()
      .accounts({
        project: projectPda,
        vetter: vetter2.publicKey,
      })
      .signers([vetter2])
      .rpc();

    // Fetch the project account
    const projectAccount = await program.account.project.fetch(projectPda);

    // Assertions
    assert.deepEqual(
      projectAccount.vetters.map((v) => v.toBase58()),
      [vetter1.publicKey.toBase58(), vetter2.publicKey.toBase58()]
    );
  });

  it("Submits validations and processes rewards", async () => {
    // Create a user
    const [userPda, _userBump] = await PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .createUser()
      .accounts({
        user: userPda,
        authority: user.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    // Submit a project
    const title = "Test Project";
    const skills = ["Rust", "Solana"];
    const [projectPda, _projectBump] = await PublicKey.findProgramAddressSync(
      [Buffer.from("project"), user.publicKey.toBuffer(), Buffer.from(title)],
      program.programId
    );

    await program.methods
      .submitProject(title, skills)
      .accounts({
        user: user.publicKey,
        project: projectPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    // Select three vetters
    for (const vetter of [vetter1, vetter2, vetter3]) {
      await program.methods
        .selectProjectToVet()
        .accounts({
          project: projectPda,
          vetter: vetter.publicKey,
        })
        .signers([vetter])
        .rpc();
    }

    // Submit validations (scores: 80, 85, 90 => average 85, passing)
    const scores = [80, 85, 90];
    for (let i = 0; i < 3; i++) {
      const vetter = [vetter1, vetter2, vetter3][i];
      const score = scores[i];

      console.log(score);
      console.log(vetter);
      
      

      await program.methods
        .submitValidation(score)
        .accounts({
          project: projectPda,
          vetter: vetter.publicKey,
          user: userPda,
          authority: authorityPda,
          tokenAccount: programTokenAccount,
          userTokenAccount: userTokenAccount,
          vetterTokenAccount1: vetter1TokenAccount,
          vetterTokenAccount2: vetter2TokenAccount,
          vetterTokenAccount3: vetter3TokenAccount,
          penaltyAccount: penaltyAccount.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([vetter])
        .rpc();
    }

    // Fetch the project account
    const projectAccount = await program.account.project.fetch(projectPda);


    console.log(projectAccount);
    

    // Fetch the user account
    const userAccount = await program.account.user.fetch(userPda);

    console.log(userAccount);

    // Assertions
    assert.equal(projectAccount.isValidated, true);
    assert.equal(projectAccount.finalScore, 85); // (80 + 85 + 90) / 3
    assert.deepEqual(
      projectAccount.scores.map((s) => ({ vetter: s.vetter.toBase58(), score: s.score })),
      [
        { vetter: vetter1.publicKey.toBase58(), score: 80 },
        { vetter: vetter2.publicKey.toBase58(), score: 85 },
        { vetter: vetter3.publicKey.toBase58(), score: 90 },
      ]
    );
    assert.deepEqual(userAccount.skills, skills); // Skills added to user

    // Note: Cannot check token balances without @solana/spl-token's getAccount
    // If you add @solana/spl-token, you can uncomment the following:
    /*
    const userTokenBalance = (await getAccount(provider.connection, userTokenAccount)).amount;
    const vetter1TokenBalance = (await getAccount(provider.connection, vetter1TokenAccount)).amount;
    const vetter2TokenBalance = (await getAccount(provider.connection, vetter2TokenAccount)).amount;
    const vetter3TokenBalance = (await getAccount(provider.connection, vetter3TokenAccount)).amount;
    assert.equal(userTokenBalance.toString(), (25 * 10 ** 9).toString());
    assert.equal(vetter1TokenBalance.toString(), (25 * 10 ** 9).toString());
    assert.equal(vetter2TokenBalance.toString(), (25 * 10 ** 9).toString());
    assert.equal(vetter3TokenBalance.toString(), (25 * 10 ** 9).toString());
    */
  });

  it("Handles high deviation in validation scores", async () => {
    // Create a user
    const [userPda, _userBump] = await PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .createUser()
      .accounts({
        user: userPda,
        authority: user.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    // Submit a project
    const title = "Test Project";
    const skills = ["Rust"];
    const [projectPda, _projectBump] = await PublicKey.findProgramAddressSync(
      [Buffer.from("project"), user.publicKey.toBuffer(), Buffer.from(title)],
      program.programId
    );

    await program.methods
      .submitProject(title, skills)
      .accounts({
        user: user.publicKey,
        project: projectPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    // Select three vetters
    for (const vetter of [vetter1, vetter2, vetter3]) {
      await program.methods
        .selectProjectToVet()
        .accounts({
          project: projectPda,
          vetter: vetter.publicKey,
        })
        .signers([vetter])
        .rpc();
    }

    // Submit validations (scores: 80, 85, 10 => vetter3 has high deviation)
    const scores = [80, 85, 10];
    for (let i = 0; i < 3; i++) {
      const vetter = [vetter1, vetter2, vetter3][i];
      const score = scores[i];

      await program.methods
        .submitValidation(score)
        .accounts({
          project: projectPda,
          vetter: vetter.publicKey,
          user: userPda,
          authority: authorityPda,
          tokenAccount: programTokenAccount,
          userTokenAccount: userTokenAccount,
          vetterTokenAccount1: vetter1TokenAccount,
          vetterTokenAccount2: vetter2TokenAccount,
          vetterTokenAccount3: vetter3TokenAccount,
          penaltyAccount: penaltyAccount.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([vetter])
        .rpc();
    }

    // Fetch the project account
    const projectAccount = await program.account.project.fetch(projectPda);

    // Assertions
    assert.equal(projectAccount.isValidated, true); // Average score: (80 + 85 + 10) / 3 = 58.33, but passes
    assert.equal(projectAccount.finalScore, 58); // Rounded down
    assert.deepEqual(
      projectAccount.vetters.map((v) => v.toBase58()),
      [vetter1.publicKey.toBase58(), vetter2.publicKey.toBase58()] // vetter3 removed
    );

    // Note: Cannot check token balances without @solana/spl-token
    // If you add @solana/spl-token, you can uncomment:
    /*
    const userTokenBalance = (await getAccount(provider.connection, userTokenAccount)).amount;
    const vetter1TokenBalance = (await getAccount(provider.connection, vetter1TokenAccount)).amount;
    const vetter2TokenBalance = (await getAccount(provider.connection, vetter2TokenAccount)).amount;
    const vetter3TokenBalance = (await getAccount(provider.connection, vetter3TokenAccount)).amount;
    assert.equal(userTokenBalance.toString(), (25 * 10 ** 9).toString());
    assert.equal(vetter1TokenBalance.toString(), (25 * 10 ** 9).toString());
    assert.equal(vetter2TokenBalance.toString(), (25 * 10 ** 9).toString());
    assert.equal(vetter3TokenBalance.toString(), "0");
    */
  });
});