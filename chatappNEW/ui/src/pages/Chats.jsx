import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import ABI from "../assets/ChatApp.json";
import address from "../assets/deployed_addresses.json";

const Chats = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [accountName, setAccountName] = useState("");  // State to store the user's name

  useEffect(() => {
    getConnectedAccount();
    getPendingRequests();
  }, []);

  // Initialize contract, provider, and signer
  const initializeContract = async () => {
    if (!window.ethereum) {
      setErrorMessage("MetaMask is not installed!");
      throw new Error("MetaMask not installed");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contractAddress = address["ChatAppModule#ChatApp"];
    const contract = new ethers.Contract(contractAddress, ABI.abi, signer);
    return { provider, signer, contract };
  };

  // Fetch pending friend requests
  const getPendingRequests = async () => {
    try {
      const { contract } = await initializeContract();
      const requests = await contract.getPendingRequests();
      setPendingRequests(requests);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      setErrorMessage("An error occurred while fetching the pending requests.");
    }
  };

  // Get the connected MetaMask account address and user name
  const getConnectedAccount = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0]; // Get the first account
        setConnectedAccount(account);

        // Fetch the user name associated with the account
        const { contract } = await initializeContract();
        const name = await contract.getUsername(account);  // Assuming there's a function `getUserName`
        setAccountName(name);
      } catch (error) {
        setErrorMessage("Failed to connect to MetaMask.");
        console.error("Error fetching connected account:", error);
      }
    } else {
      setErrorMessage("MetaMask is not installed.");
    }
  };

  // Accept a pending friend request
  const acceptFriendRequest = async (senderAddress, index) => {
    try {
      setLoadingRequests((prevState) => ({ ...prevState, [index]: true }));

      const { contract } = await initializeContract();
      const tx = await contract.acceptFriendRequest(senderAddress);
      await tx.wait();

      setLoadingRequests((prevState) => ({ ...prevState, [index]: false }));
      alert("Friend request accepted!");
      getPendingRequests(); // Refresh the pending requests list
    } catch (error) {
      setLoadingRequests((prevState) => ({ ...prevState, [index]: false }));
      setErrorMessage("An error occurred while accepting the friend request.");
      console.error("Error accepting friend request:", error);
    }
  };

  return (
    <div className="flex justify-center items-start px-10 mt-8">
      <div className="w-[600px] bg-gray-200 p-6 shadow-md rounded-md">
        {errorMessage && (
          <div className="text-red-500 text-sm mb-4">
            <p>{errorMessage}</p>
          </div>
        )}

        <h2 className="text-xl font-bold text-[#1a5276] mb-4">Pending Friend Requests</h2>

        {connectedAccount && (
          <div className="mb-6">
            <p><strong>Connected Account:</strong> {connectedAccount}</p>
            <p><strong>Account Name:</strong> {accountName || "Fetching name..."}</p>
          </div>
        )}

        <div>
          {pendingRequests.length === 0 ? (
            <p>No pending friend requests.</p>
          ) : (
            <ul>
              {pendingRequests.map((requestAddress, index) => (
                <li key={index} className="mb-4">
                  <p>
                    <strong>Sender Address:</strong> {requestAddress}
                  </p>
                  
                  {/* Accept friend request */}
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-md mt-2"
                    onClick={() => acceptFriendRequest(requestAddress, index)}
                    disabled={loadingRequests[index]}
                  >
                    {loadingRequests[index] ? "Accepting..." : "Accept Friend Request"}
                  </button>
                  <hr />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chats;
