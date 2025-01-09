import React, { useState } from 'react';
import { ethers } from 'ethers';
// import Navbar from '../components/Navbar';
import ABI from '../assets/ChatApp.json';
import address from '../assets/deployed_addresses.json';

const AccountCreate = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function createAccount() {

  
    if (!window.ethereum) {
      alert('Please install MetaMask');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractABI = ABI.abi;
      const contractAddress = address['ChatAppModule#ChatApp'];
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      console.log(signer.address);
      const tx = await contract.createAccount(name, phoneNumber, gender);
      await tx.wait();
      setSuccess('Account created successfully!');
      console.log("Successfully Added!");
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* <Navbar /> */}
      <div className="ml-[70px] flex flex-col items-center justify-center">
        <div className="mt-10 w-[400px] p-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-md">
          <h1 className="text-white text-3xl font-bold mb-4">Create Your Account</h1>
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 mb-4 rounded-md"
          />
          <input
            type="number"
            placeholder="Enter Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-2 mb-4 rounded-md"
          />
          <input
            type="text"
            placeholder="Enter Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-2 mb-4 rounded-md"
          />
          <div className="flex justify-center">
            <button
              onClick={createAccount}
              className="w-full p-2 mt-4 bg-blue-600 text-white rounded-md"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
          {error && <p className="mt-4 text-red-500">{error}</p>}
          {success && <p className="mt-4 text-green-500">{success}</p>}
        </div>
      </div>
    </>
  );
};

export default AccountCreate;
