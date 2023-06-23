import styles from '../styles/Home.module.css';
import { useMetaplex } from "./useMetaplex";
import { useState, useEffect } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair} from '@solana/web3.js';
import secret from './spcollectionwallet.json';


export const MintNFTs = ({ onClusterChange }) => {
  const { metaplex } = useMetaplex();
  const wallet = useWallet();
  const walletAddress = wallet.publicKey?.toBase58() || null;



  const [nft, setNft] = useState(null);
  const [data, setData] = useState(null);


  useEffect(() => {

    if (!wallet.connected || !walletAddress) {
      return;
    }
   

    const body = {
      method: "qn_fetchNFTs",
      params: [walletAddress, []],
    };
    const options = {
      method: "POST",
      body: JSON.stringify(body),
    };

    fetch(
      "https://sparkling-little-reel.solana-devnet.discover.quiknode.pro/172aaccc92d5d04a9c9dec999afceb2ee5bb72bd/",
      options
    )
    .then(response => response.json())
    .then(data => setData(data));
  
  
  }, [wallet, walletAddress]);
  
  


  const candyMachineAddress = new PublicKey(process.env.NEXT_PUBLIC_CANDY_MACHINE_ID);
  const WALLET = Keypair.fromSecretKey(new Uint8Array(secret));
  let candyMachine;

  const checkEligibility = async () => {
    candyMachine = await metaplex
      .candyMachines()
      .findByAddress({ address: candyMachineAddress });
  };


  const onClick = async () => {
    const { nft } = await metaplex.candyMachines().mint({
        candyMachine,
        collectionUpdateAuthority: WALLET.publicKey,
        },{commitment:'finalized'})

    setNft(nft);
  };

  if (!wallet.connected ) {
    return null;
  }else {
    checkEligibility();
  }

  if (!data) {
    return 'Checking NFTs...';
  }






  return (
    <div>
      <select onChange={onClusterChange} className={styles.dropdown}>
        <option value="devnet">Devnet</option>
        <option value="mainnet">Mainnet</option>
        <option value="testnet">Testnet</option>
      </select>
      <div>
        <div className={styles.container}>
          <h1 className={styles.title}>NFT Mint Address</h1>
          <div className={styles.nftForm}>
            <input
              type="text"
              value={nft ? nft.mint.address.toBase58() : ""}
              readOnly
            />
            <button onClick={onClick}>Pick Random NFT</button>
          </div>
          {nft && (
            <div className={styles.nftPreview}>
              <h1>{nft.name}</h1>
              <img
                src={nft?.json?.image || '/fallbackImage.jpg'}
                alt="The downloaded illustration of the provided NFT address."
              />
            </div>
          )}
        </div>
      </div>
      <div>
      <h1> Here are NFTs you have Already Minted From this Collection</h1>
      <ul>
        {data.result.assets.map((nft) => (
          nft.collectionAddress === "FvxJaJsAV9vxxbo2RMJTHUUfQA3nvnJ5dV23ApAwEECZ" &&
           (
            <li key={nft.tokenAddress}>
              <div className={styles.nftPreview}>
                <img
                  src={nft.imageUrl}
                  alt={nft.description}
                />
                <div className={styles.container}>
                  <div className={styles.title}>{nft.name}</div>
                  <p className={styles.title}>{nft.description}</p>
                </div>
                <div className={styles.container}>
                  {nft.traits.map((trait) => (
                    <span className={styles.title}>
                      {trait["trait_type"]}: {trait.value}
                    </span>
                  ))}
                </div>
              </div>
            </li>
          )
        ))}
      </ul>
    </div>
      
   
    </div>
    
  );
};
