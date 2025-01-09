import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import ABI from "../assets/ChatApp.json";
import address from "../assets/deployed_addresses.json";

const MakeChat = () => {
  const [friendsList, setFriendsList] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedFriendName, setSelectedFriendName] = useState(null); // State to store selected friend's name
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [accountName, setAccountName] = useState(""); // Store the connected user's name
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    getConnectedAccount();
    getFriendsList();
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

  // Fetch connected account info
  const getConnectedAccount = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const account = accounts[0];
        setConnectedAccount(account);

        // Fetch the connected user's name
        const { contract } = await initializeContract();
        const name = await contract.getUsername(account);
        setAccountName(name);
      } catch (error) {
        setErrorMessage("Failed to connect to MetaMask.");
        console.error("Error fetching connected account:", error);
      }
    } else {
      setErrorMessage("MetaMask is not installed.");
    }
  };

  // Fetch the list of friends
  const getFriendsList = async () => {
    try {
      const { contract } = await initializeContract();
      const friends = await contract.getMyFriendList();
      setFriendsList(friends);
      setLoadingFriends(false);
    } catch (error) {
      console.error("Error fetching friends list:", error);
      setErrorMessage("An error occurred while fetching the friends list.");
      setLoadingFriends(false);
    }
  };

  // Fetch messages with selected friend
  const getMessages = async (friendAddress) => {
    try {
      const { contract } = await initializeContract();
      const chatMessages = await contract.getMessages(friendAddress);
      setMessages(chatMessages);

      // Fetch the selected friend's name
      const friendName = await contract.getUsername(friendAddress);
      setSelectedFriendName(friendName); // Store the selected friend's name
    } catch (error) {
      console.error("Error fetching messages:", error);
      setErrorMessage("An error occurred while fetching messages.");
    }
  };

  // Handle sending new messages
  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    try {
      const { contract } = await initializeContract();
      await contract.sendMessage(selectedFriend, newMessage);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: connectedAccount, msg: newMessage, timestamp: Date.now() },
      ]);
      setNewMessage(""); // Clear the input field
    } catch (error) {
      setErrorMessage("An error occurred while sending the message.");
      console.error("Error sending message:", error);
    }
  };

  // Format timestamp to readable time
  const formatTimestamp = (timestamp) => {
    const timestampInMillis = typeof timestamp === "bigint" ? Number(timestamp) * 1000 : timestamp * 1000;
    return new Date(timestampInMillis).toLocaleTimeString();
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side (Chat Interface) */}
      <div className="w-2/3 p-6">
        <h2 className="text-xl font-bold text-[#1a5276] mb-4">Chat</h2>
        {selectedFriend ? (
          <>
            {/* Display the name of the selected friend in the chat interface */}
            <h3 className="text-lg font-semibold text-[#1a5276] mb-4">Chatting with {selectedFriendName}</h3>
            <div className="border rounded-md p-4 h-[60vh] overflow-y-scroll">
              {messages.length === 0 ? (
                <p>No messages yet. Start a conversation!</p>
              ) : (
                <ul className="space-y-4">
                  {messages.map((message, index) => (
                    <li
                      key={index}
                      className={`flex ${message.sender === connectedAccount ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`inline-block p-3 rounded-md ${
                          message.sender === connectedAccount ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                        }`}
                      >
                        <p>{message.msg}</p>
                        <small>{formatTimestamp(message.timestamp)}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Type your message"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-4 py-2 mt-2 rounded-md"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p>Please select a friend to start chatting.</p>
        )}
      </div>

      {/* Right side (Account Info & Friends List) */}
      <div className="w-1/3 p-6 bg-gray-200">
        <div className="mb-4">
          <h3 className="font-bold">Account Information</h3>
          <p>
            <strong>Address:</strong> {connectedAccount}
          </p>
          <p>
            <strong>Username:</strong> {accountName || "Fetching name..."}
          </p>
        </div>

        <div className="mb-4">
          <h3 className="font-bold">Friends List</h3>
          {loadingFriends ? (
            <p>Loading friends...</p>
          ) : (
            <ul>
              {friendsList.length === 0 ? (
                <p>No friends yet. Add some friends!</p>
              ) : (
                friendsList.map((friend, index) => (
                  <li
                    key={index}
                    className="mb-2 cursor-pointer text-blue-500"
                    onClick={() => {
                      setSelectedFriend(friend);
                      getMessages(friend); // Fetch messages when a friend is selected
                    }}
                  >
                    {/* Display the name of the friend in the list */}
                    {selectedFriend === friend ? (
                      <strong>{selectedFriendName}</strong>
                    ) : (
                      <span>{friend}</span>
                    )}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MakeChat;
