import React, { useEffect, useState } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const TEST_GIFS = [
  "https://media.giphy.com/media/l46Ct6mmy0R2aSvaE/giphy.gif",
  "https://media.giphy.com/media/PXPBgElnX7UvIJGVVS/giphy.gif",
  "https://media.giphy.com/media/rR2AWZ3ip77r2/giphy.gif",
  "https://media.giphy.com/media/jsOU42Wmd7Vfy/giphy.gif",
];

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

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching GIF list...");

      // Call Solana program here.

      // Set state
      setGifList(TEST_GIFS);
    }
  }, [walletAddress]);

  /*
   * Let's define this method so our code doesn't break.
   * We will write the logic for this next!
   */
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

  const sendGif = async () => {
    if (inputValue.length > 0) {
      console.log("Gif link:", inputValue);
      setGifList([...gifList, inputValue]);
      setInputValue("");
    } else {
      console.log("Empty input. Try again.");
    }
  };

  /*
   * We want to render this UI when the user hasn't connected
   * their wallet to our app yet.
   */
  const renderNotConnectedContainer = () => (
    <button
      className="cursor-pointer px-4 py-1 rounded-sm bg-gradient-to-tr from-green-600 to-green-500 text-white font-semibold tracking-wide"
      style={{ cursor: "pointer" }}
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderConectedContainer = () => (
    <div className="w-full">
      {/* Go ahead and add this input and button to start */}
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
      <div className="grid gid-cols-2 md:grid-cols-4">
        {gifList.map((gif) => (
          <div className="relative" key={gif}>
            <img
              src={gif}
              alt={gif}
              className="bg-cover w-full h-64 rounded-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );

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
