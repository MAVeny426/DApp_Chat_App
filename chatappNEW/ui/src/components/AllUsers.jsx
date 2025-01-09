import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import ABI from "../assets/ChatApp.json";
import address from "../assets/deployed_addresses.json";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [friendLists, setFriendLists] = useState({});
  const [loadingUsers, setLoadingUsers] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    getAllUsers();
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

  // Fetch all users from the smart contract
  const getAllUsers = async () => {
    try {
      const { contract } = await initializeContract();
      const usersList = await contract.getAllAppUser();
      setUsers(usersList);
      fetchFriendLists(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMessage("An error occurred while fetching the users.");
    }
  };

  // Fetch friend lists for all users
  const fetchFriendLists = async (usersList) => {
    try {
      const { contract } = await initializeContract();
      const friendListPromises = usersList.map(async (user) => {
        const friendList = await contract.getMyFriendList();
        return { [user.accountAddress]: friendList };
      });
      const allFriendLists = await Promise.all(friendListPromises);
      setFriendLists(allFriendLists.reduce((acc, curr) => ({ ...acc, ...curr }), {}));
    } catch (error) {
      console.error("Error fetching friend lists:", error);
      setErrorMessage("An error occurred while fetching the friend lists.");
    }
  };

  // Send a friend request
  const sendFriendRequest = async (friendAddress, index) => {
    try {
      setLoadingUsers((prevState) => ({ ...prevState, [index]: true }));

      const { contract } = await initializeContract();
      const tx = await contract.sendFriendRequest(friendAddress);
      await tx.wait();

      setLoadingUsers((prevState) => ({ ...prevState, [index]: false }));
      alert("Friend request sent!");
      fetchFriendLists(users); // Refresh friend lists
    } catch (error) {
      setLoadingUsers((prevState) => ({ ...prevState, [index]: false }));
      setErrorMessage("An error occurred while sending the friend request.");
      console.error("Error sending friend request:", error);
    }
  };

  // Accept a pending friend request
  const acceptFriendRequest = async (senderAddress, index) => {
    try {
      setLoadingUsers((prevState) => ({ ...prevState, [index]: true }));

      const { contract } = await initializeContract();
      const tx = await contract.acceptFriendRequest(senderAddress);
      await tx.wait();

      setLoadingUsers((prevState) => ({ ...prevState, [index]: false }));
      alert("Friend request accepted!");
      fetchFriendLists(users); // Refresh friend lists after accepting request
    } catch (error) {
      setLoadingUsers((prevState) => ({ ...prevState, [index]: false }));
      setErrorMessage("An error occurred while accepting the friend request.");
      console.error("Error accepting friend request:", error);
    }
  };

  // Add a friend directly (used after friend request is accepted)
  const addFriend = async (friendAddress, index) => {
    try {
      setLoadingUsers((prevState) => ({ ...prevState, [index]: true }));

      const { contract } = await initializeContract();
      const tx = await contract.addFriend(friendAddress);
      await tx.wait();

      setLoadingUsers((prevState) => ({ ...prevState, [index]: false }));
      alert("Friend added successfully!");
      fetchFriendLists(users); // Refresh friend lists after adding friend
    } catch (error) {
      setLoadingUsers((prevState) => ({ ...prevState, [index]: false }));
      setErrorMessage("An error occurred while adding the friend.");
      console.error("Error adding friend:", error);
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

        <h2 className="text-xl font-bold text-[#1a5276] mb-4">All Users</h2>

        <div>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <ul>
              {users.map((user, index) => (
                <li key={index} className="mb-4">
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Address:</strong> {user.accountAddress}
                  </p>

                  {/* Button to send a friend request */}
                  {!friendLists[user.accountAddress]?.includes(user.accountAddress) ? (
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
                      onClick={() => sendFriendRequest(user.accountAddress, index)}
                      disabled={loadingUsers[index]}
                    >
                      {loadingUsers[index] ? "Sending..." : "Send Friend Request"}
                    </button>
                  ) : (
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded-md mt-2"
                      onClick={() => acceptFriendRequest(user.accountAddress, index)}
                      disabled={loadingUsers[index]}
                    >
                      {loadingUsers[index] ? "Accepting..." : "Accept Friend Request"}
                    </button>
                  )}

                  {/* Displaying friend list */}
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-700">Friend List</h3>
                    {friendLists[user.accountAddress] && friendLists[user.accountAddress].length > 0 ? (
                      <ul>
                        {friendLists[user.accountAddress].map((friendAddress, idx) => (
                          <li key={idx} className="text-sm text-gray-600">
                            {friendAddress}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No friends yet.</p>
                    )}
                  </div>

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

export default AllUsers;
