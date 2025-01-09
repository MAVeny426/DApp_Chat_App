// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

contract ChatApp {

    // USER STRUCT (with phone number as uint256 and gender)
    struct User {
        string name;
        uint256 phoneNumber;  // Changed to uint256 to store phone number as a number
        string gender;
        address[] friendList;
    }

    struct Message {
        address sender;
        uint256 timestamp;
        string msg;
    }

    struct AllUserStruct {
        string name;
        address accountAddress;
    }

    AllUserStruct[] public getAllUsers;

    mapping(address => User) public userList;
    mapping(bytes32 => Message[]) public allMessages;
    mapping(address => mapping(address => bool)) public pendingRequests;

    // CHECK USER EXIST
    function checkUserExists(address pubkey) public view returns (bool) {
        return bytes(userList[pubkey].name).length > 0;
    }

    // CREATE ACCOUNT (with phone number as uint256)
    function createAccount(
        string memory name,
        uint256 phoneNumber,  // Phone number as uint256
        string memory gender
    ) public {
        require(checkUserExists(msg.sender) == false, "User Already Exists");
        require(bytes(name).length > 0, "Username cannot be empty");
        require(phoneNumber > 0, "Phone number cannot be empty");
        require(bytes(gender).length > 0, "Gender cannot be empty");

        // Storing user details including phone number as a uint256
        userList[msg.sender].name = name;
        userList[msg.sender].phoneNumber = phoneNumber;
        userList[msg.sender].gender = gender;

        // Adding user to the global list
        getAllUsers.push(AllUserStruct(name, msg.sender));
    }

     // GET USERNAME
    function getUsername(address pubkey) public view returns (string memory) {
        require(checkUserExists(pubkey), "User is not registered");
        return userList[pubkey].name;
    }


    // ADD FRIEND
    function addFriend(address friend_key) public {
        require(checkUserExists(msg.sender), "Create an account first");
        require(checkUserExists(friend_key), "User is not registered");
        require(msg.sender != friend_key, "Cannot add yourself as a friend");
        require(!isAlreadyFriend(msg.sender, friend_key), "Already friends");

        userList[msg.sender].friendList.push(friend_key);
    }

    // SEND FRIEND REQUEST
    function sendFriendRequest(address friend_key) public {
        require(checkUserExists(msg.sender), "Create an account first");
        require(checkUserExists(friend_key), "User is not registered");
        require(msg.sender != friend_key, "Cannot send a request to yourself");
        require(!pendingRequests[msg.sender][friend_key], "Request already sent");

        // Set the request status as 'true' indicating it's pending
        pendingRequests[msg.sender][friend_key] = true;
    }

    // ACCEPT FRIEND REQUEST
    function acceptFriendRequest(address sender) public {
        require(checkUserExists(msg.sender), "Create an account first");
        require(pendingRequests[sender][msg.sender], "No pending request");

        // Add the sender to the recipient's friend list
        userList[msg.sender].friendList.push(sender);
        userList[sender].friendList.push(msg.sender);

        // Set the request status as 'false' indicating the request is handled
        pendingRequests[sender][msg.sender] = false;
    }

    // GET PENDING FRIEND REQUESTS
    function getPendingRequests() public view returns (address[] memory) {
        uint256 count = 0;
        address[] memory pending = new address[](getAllUsers.length);

        for (uint256 i = 0; i < getAllUsers.length; i++) {
            address userAddress = getAllUsers[i].accountAddress;
            if (pendingRequests[userAddress][msg.sender]) {
                pending[count] = userAddress;
                count++;
            }
        }

        return pending;
    }

   
    // GET ALL APP USERS
    function getAllAppUser() public view returns (AllUserStruct[] memory) {
        return getAllUsers;
    }

    // GET USER DETAILS
    function getUserDetails(address pubkey) public view returns (string memory, uint256, string memory) {
        require(checkUserExists(pubkey), "User is not registered");
        User memory user = userList[pubkey];
        return (user.name, user.phoneNumber, user.gender);
    }

    // GET FRIEND LIST
    function getMyFriendList() public view returns (address[] memory) {
        return userList[msg.sender].friendList;
    }

    // GET CHAT CODE (Helper function to ensure unique chat code)
    function getChatCode(address pubkey1, address pubkey2) internal pure returns (bytes32) {
        if (pubkey1 < pubkey2) {
            return keccak256(abi.encodePacked(pubkey1, pubkey2));
        } else {
            return keccak256(abi.encodePacked(pubkey2, pubkey1));
        }
    }

    // SEND MESSAGE
    function sendMessage(address friend_key, string memory _msg) public {
        require(checkUserExists(msg.sender), "Create an account first");
        require(checkUserExists(friend_key), "User is not registered");
        require(isAlreadyFriend(msg.sender, friend_key), "Not friends");

        bytes32 chatCode = getChatCode(msg.sender, friend_key);
        Message memory newMsg = Message(msg.sender, block.timestamp, _msg);
        allMessages[chatCode].push(newMsg);
    }

    // CHECK IF ALREADY FRIEND
    function isAlreadyFriend(address pubkey1, address pubkey2) internal view returns (bool) {
        for (uint256 i = 0; i < userList[pubkey1].friendList.length; i++) {
            if (userList[pubkey1].friendList[i] == pubkey2) {
                return true;
            }
        }
        return false;
    }

    // READ MESSAGE (Fetch messages between two users)
    function getMessages(address friend_key) public view returns (Message[] memory) {
        bytes32 chatCode = getChatCode(msg.sender, friend_key);
        return allMessages[chatCode];
    }
}

