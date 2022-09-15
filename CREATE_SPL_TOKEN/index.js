import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from '@solana/spl-token';
import {readFileSync, promises as fsPromises} from 'fs';


(async () => {

		// Step 1: Connect to cluster and generate two new Keypairs
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

        const contents = await fsPromises.readFile('./id.json', 'utf-8');
        const secretKey = Uint8Array.from(contents.toString().replace('[', '').replace(']', '').split(','));

        const creatorWallet = Keypair.fromSecretKey(secretKey);
        
        const myPhantomWallet = new PublicKey('DsbsLhT7v8VcHCMX9vAWdYgxYKt5dh55XXin5hjftX44');

        // Step 2: Airdrop SOL into your from wallet
        const fromAirdropSignature = await connection.requestAirdrop(creatorWallet.publicKey, LAMPORTS_PER_SOL);
        // Wait for airdrop confirmation
        await connection.confirmTransaction(fromAirdropSignature, { commitment: "confirmed" });

        // Step 3: Create new token mint and get the token account of the creatorWallet address
        //If the token account does not exist, create it
        const mint = await createMint(connection, creatorWallet, creatorWallet.publicKey, creatorWallet.publicKey, 9);
        
        const fromTokenAccount = await 
        getOrCreateAssociatedTokenAccount(
                connection,
                creatorWallet,
                mint,
                creatorWallet.publicKey
        );
        console.log("NEW TOKEN: " , mint.toBase58());
        
        //Step 4: Mint a new token to the from account
        let signature = await mintTo(
            connection,
            creatorWallet,
            mint,
            fromTokenAccount.address,
            creatorWallet.publicKey,
            1000000000000000,
            []
        );
        console.log('1 MILLION ' , mint.toBase58() , ' HAS BEEN SUCCESSFULLY MINTED.\n', 'TRANSACTION SIGNATURE: ', signature);
        
        
        //Step 5: Get the token account of the to-wallet address and if it does not exist, create it
        const myPhantomWalletTokenAccount = await getOrCreateAssociatedTokenAccount(connection, creatorWallet, mint, myPhantomWallet);

        //Step 6: Transfer the new token to the to-wallet's token account that was just created
        // Transfer the new token to the "toTokenAccount" we just created
        signature = await transfer(
            connection,
            creatorWallet,
            fromTokenAccount.address,
            myPhantomWalletTokenAccount.address,
            creatorWallet.publicKey,
            1000000000000,
            []
        );
        console.log("SUCCESSFULLY TRANSFERRED 1000 ", mint.toBase58(), " TO ADDRESS: ", myPhantomWallet.toBase58(), '\nSIGNATURE:', signature);
            
 
})();
