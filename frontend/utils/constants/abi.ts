export const abi = [
  {
    inputs: [
      {
        internalType: "address[]",
        name: "owners",
        type: "address[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "Wallet__AmountShouldBeGreaterThanZero",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__DuplicateOwnersNotAllowed",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__InvalidTransactionIndex",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__NotAnAcceptedOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__NotEnoughBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__OwnerHasAlreadyApproved",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__OwnerNotInvited",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__OwnersAreRequired",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__TransactionAlreadyExecuted",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__TransactionDoesNotHaveEnoughApprovals",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__TransactionFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__TransactionNotApprovedByTheOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__TransactionStatusShouldBePending",
    type: "error",
  },
  {
    inputs: [],
    name: "Wallet__ZeroAddressNotAllowed",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "InvitationAccepted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "InvitationDeclined",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "InvitedOwnerRemovedFromWallet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnerInvited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnerLeftTheWallet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "transactionIndex",
        type: "uint256",
      },
    ],
    name: "TransactionApproved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "transactionIndex",
        type: "uint256",
      },
    ],
    name: "TransactionCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "transactionIndex",
        type: "uint256",
      },
    ],
    name: "TransactionDisapproved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "transactionIndex",
        type: "uint256",
      },
    ],
    name: "TransactionExecuted",
    type: "event",
  },
  {
    inputs: [],
    name: "acceptInvitation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "transactionIndex",
        type: "uint256",
      },
    ],
    name: "approveTransaction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "createTransaction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "declineInvitation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "transactionIndex",
        type: "uint256",
      },
    ],
    name: "disapproveTransaction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getApprovalThreshold",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getOwnerCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "getOwnerStatus",
    outputs: [
      {
        internalType: "enum Wallet.OwnerStatus",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getOwners",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "transactionIndex",
        type: "uint256",
      },
    ],
    name: "getTransaction",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
      {
        internalType: "enum Wallet.TransactionStatus",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTransactionCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "inviteOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "leaveWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "removeInvitedOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;
