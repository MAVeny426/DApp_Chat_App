import React,{ useState } from 'react';
import internet from '../images/internet.jpg';
// import Navbar from '../components/Navbar';

import { ethers } from 'ethers'

const Home = () => {

  const [signerAddress, setSignerAddress] = useState("");


  async function connectToMetamask(e) {
    e.preventDefault();
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      setSignerAddress(signerAddress);
      // alert(`${signerAddress} is logged in`);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      alert("Failed to connect to MetaMask. Please try again.");
    }
  }


  return (

    <>
    {/* <Navbar /> */}
    <div className="ml-[70px] flex">
        <div className="h-[50px] w-[400px] mt-6 bg-gradient-to-r from-blue-500 to-blue-700 p-2 rounded-md flex justify-center ml-[40px]">
          <button
            onClick={connectToMetamask}
            className="text-white tracking-wider text-2xl font-extrabold"
          >
            CONNECT TO METAMASK
          </button>
        </div>
        <div className="ml-4 mt-6">
          <p className="text-lg font-bold text-blue-600">
            {signerAddress ? `Connected: ${signerAddress}` : "Not Connected"}
          </p>
        </div>
      </div>
    <div className="h-screen w-screen">
      <img 
        src={internet} 
        alt="internet" 
        className="h-full w-full object-cover" 
      />

      
    </div>

    </>
  );
}

export default Home;

