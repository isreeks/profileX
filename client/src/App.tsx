import React from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import './App.css';
import WalletConnect from './components/WalletConnect';
import CreateUser from './components/CreateUser';
import UpdateProfile from './components/UpdateProfile';
import SubmitProject from './components/CreateProject';
import SelectProjectToVet from './components/SelectProjectToVet';
import SubmitValidation from './components/SubmitValidation';
import ListAccounts from './components/ListAccounts';
import { Fund } from './components/Fund';
import TestSubmitValidation from './components/Test';
import TestTokenAccounts from './components/TestTokenAccounts';

const App: React.FC = () => {
  const network = WalletAdapterNetwork.Devnet; // Use Devnet or Localnet
  const endpoint = 'http://127.0.0.1:8899'; // Replace with "http://127.0.0.1:8899" for local validator
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="App">
            <h1>Solana Profile Program</h1>
            <TestTokenAccounts />
            <WalletMultiButton />
            <WalletConnect />
            {/* <TestSubmitValidation /> */}
            <CreateUser />
            <UpdateProfile />
            <SubmitProject />
            <SelectProjectToVet />
            <SubmitValidation />
            <ListAccounts />
            <Fund />
            
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;