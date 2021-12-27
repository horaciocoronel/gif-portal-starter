import React, { useEffect, useState } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import kp from "./keypair.json";

import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";

import idl from "./idl.json";

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl("devnet");

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed",
};

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  // State
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [gifList, setGifList] = useState([]);

  /*
   * This function holds the logic for deciding if a Phantom Wallet is
   * connected or not
   */
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found!");

          const response = await solana.connect();
          // const response = await solana.connect({
          //   onlyIfTrusted: true,
          // });

          console.log(
            "Connected with Public Key:",
            response.publicKey.toString()
          );
          /*
           * Set the user's publicKey in state to be used later!
           */
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert("Solana object not found! Get a Phantom Wallet 👻");
      }
    } catch (error) {
      console.error(error);
    }
  };

  /*
   * When our component first mounts, let's check to see if we have a connected
   * Phantom Wallet
   */
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  const getGifList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      console.log("Got the account", account);
      console.log(account.totalGifs.toString());
      setGifList(account.gifList);
    } catch (error) {
      console.log("Error in getGifList: ", error);
      setGifList(null);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching GIF list...");
      getGifList();
    }
  }, [walletAddress]);

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping");
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log(
        "Created a new BaseAccount w/ address:",
        baseAccount.publicKey.toString()
      );
      await getGifList();
    } catch (error) {
      console.log("Error creating BaseAccount account:", error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log("Connected with Public Key:", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const sendGif = async () => {
    if (inputValue.length === 0) {
      console.log("No gif link given!");
      return;
    }
    setInputValue("");
    console.log("Gif link:", inputValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });

      console.log("GIF successfully sent to program", inputValue);

      await getGifList();
    } catch (error) {
      console.log("Error sending GIF:", error);
    }
  };

  /*
   * We want to render this UI when the user hasn't connected
   * their wallet to our app yet.
   */
  const renderNotConnectedContainer = () => {
    console.log(gifList, gifList === null);
    if (gifList === null || gifList.length < 1) {
      return (
        <div className="connected-container">
          <button
            className="cta-button submit-gif-button"
            onClick={createGifAccount}
          >
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      );
    } else {
      return (
        <button
          className="cursor-pointer px-4 py-1 rounded-sm bg-gradient-to-tr from-green-600 to-green-500 text-white font-semibold tracking-wide"
          style={{ cursor: "pointer" }}
          onClick={connectWallet}
        >
          Connect to Wallet
        </button>
      );
    }
  };

  const renderConectedContainer = () => (
    <div className="w-full">
      {gifList === null && (
        <div className="connected-container">
          <button
            className="cta-button submit-gif-button"
            onClick={createGifAccount}
          >
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      )}
      <form
        className="w-1/2 m-auto pb-4"
        onSubmit={(event) => {
          event.preventDefault();
          sendGif();
        }}
      >
        <input
          type="text"
          className="w-auto h-8 rounded px-3 text-lg"
          placeholder="Enter gif link!"
          value={inputValue}
          onChange={onInputChange}
        />
        <button type="submit" className="cta-button submit-gif-button">
          Submit
        </button>
      </form>
      <div className="grid gid-cols-2 md:grid-cols-4 gap-4">
        {console.log(gifList)}
        {gifList?.map((gif, index) => (
          <div key={index}>
            <div className="relative h-64 overflow-hidden">
              <div
                className="w-full h-full bg-center hover:scale-105 transform duration-150 bg-cover absolute"
                style={{ backgroundImage: `url(${gif.gifLink})` }}
              ></div>
              {/* <img
                src={gif.gifLink}
                alt={gif.gifLink}
                className="absolute hover:scale-105 transform duration-150 rounded-sm"
              /> */}
            </div>
            <p className="bg-black bg-opacity-40 text-center text-white">
              Address:
              <button
                className="text-sm block m-auto text-white"
                data-bs-toggle="tooltip"
                data-bs-placement="bottom"
                title={`Address: ${gif.userAddress.toString()}`}
              >
                {truncateAddress(gif.userAddress.toString())}
              </button>
            </p>
            {console.log(gif.userAddress.toString())}
          </div>
        ))}
      </div>
    </div>
  );

  const truncateAddress = (addressStr) => {
    return addressStr.slice(0, 4) + "..." + addressStr.slice(-4);
  };

  // UseEffects
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <div
      className="bg-cover min-h-screen"
      style={{
        backgroundImage:
          "url(https://files.tofugu.com/articles/travel/2013-10-01-jiufen-spirited-away/header-2560x.jpg)",
      }}
    >
      {/* This was solely added for some styling fanciness */}
      <div className={walletAddress ? "authed-container" : "container"}>
        <div className="header-container">
          <div className="flex justify-start items-center mb-4">
            <img
              src="/totoroImg.svg"
              className="h-24 inline-block pr-2"
              alt="Totoro"
            />
            <div>
              <p className="text-white text-4xl font-semibold">
                StudioGIFLI Portal
              </p>
              <span className="text-white text-sm block">
                {" "}
                View your GIF collection in the metaverse ✨
              </span>
            </div>
          </div>

          {/* Add the condition to show this only if we don't have a wallet address */}
          {!walletAddress && renderNotConnectedContainer()}
          {/* {walletAddress && (
            <p className="text-white">
              Connected with address:{" "}
              <span className="block">{walletAddress}</span>
            </p>
          )} */}
          {walletAddress && renderConectedContainer()}
        </div>
        <div className="">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
