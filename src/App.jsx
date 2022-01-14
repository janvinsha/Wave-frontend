import React,{useState,useEffect} from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

export default function App() {

/*
  * Just a state variable we use to store our user's public wallet.
  */
  const [currentAccount, setCurrentAccount] = useState("");
    const [allWaves, setAllWaves] = useState([]);
    const [message, setMessage] = useState("");

    /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const contractAddress = "0x81739106e96196efA87F558D41a5412249BBC2cC";
  
  const contractABI = abi.abi;


    /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
  const { ethereum } = window;

  try {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      const waves = await wavePortalContract.getAllWaves();

      const wavesCleaned = waves.map(wave => {
        return {
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
        };
      });

      setAllWaves(wavesCleaned);
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
  }
};
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
        
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        getAllWaves()
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }


  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }
const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = wavePortalContract.wave(message, { gasLimit: 300000 })
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }
  /**
 * Listen in for emitter events!
 */
useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);
useEffect(() => {
  checkIfWalletIsConnected()
},[])

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
         🤺Hello!🤺
        </div>

        <div className="bio">
        <h2>I am Janvinsha</h2>
       <p> Full-Stack developer with 3years of experience in programming and a drive to solve problems.
<h3 >Specialties</h3>
React, React Native, Redux, React Context, Data structures and Algorithms, Javascript, Typescript, Python, Solidity, Ganache, Truffle, Hardhat, Web3, Git, Nodejs, MongoDB, Html, Css, Sass, JQuery, Styled-components, Framer-motion, MVC Architecture, Test Driven Development (TDD)
</p>
<h3>Contact</h3>
<span className="links">
<a href="https://github.com/janvinsha">Github</a>
<a href="https://jandevincent.com">Porfolio</a>
<a href="https://www.linkedin.com/in/jande-vincent-1650431b9">LinkedIn</a>
<a href="http://www.twitter.com/janvinsha">Twitter</a>
</span>
        </div>
       {currentAccount && <><textarea className="waveTextArea" rows="4" value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Write a message for me"/>
        <button className="waveButton" onClick={wave}>
          Wave and send message
        </button>
        </>}
                  {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet to Wave
          </button>
        )}
    
        {allWaves.map((wave, index) => {
          return (
            <div key={index} className="wavesBox">
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}

      </div>
    </div>
  );
}
