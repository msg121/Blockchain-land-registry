export const landRegistryABI = [
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			}
		],
		"name": "acceptTransfer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "admin",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "AccessControlBadConfirmation",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "neededRole",
				"type": "bytes32"
			}
		],
		"name": "AccessControlUnauthorizedAccount",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			}
		],
		"name": "cancelTransfer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "CannotRecoverToCurrentOwner",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "CannotRecoverToZeroAddress",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "EnforcedPause",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ExpectedPause",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidAddress",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidArea",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidCoordinates",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidMetadataHash",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "InvalidPropertyId",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "NoPendingTransfer",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "NotPendingOwner",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "NotPropertyOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			}
		],
		"name": "OwnerIndexCorrupted",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			}
		],
		"name": "PropertyAlreadyExists",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "PropertyAlreadyVerified",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			}
		],
		"name": "PropertyNotFound",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ReentrancyGuardReentrantCall",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "SameOwner",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "TransferAlreadyPending",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "EmergencyPaused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "EmergencyUnpaused",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "grantRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "pause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Paused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "oldMetadataHash",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "newMetadataHash",
				"type": "bytes32"
			}
		],
		"name": "PropertyMetadataUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "authorizedBy",
				"type": "address"
			}
		],
		"name": "PropertyRecovered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "metadataHash",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "uint64",
				"name": "area",
				"type": "uint64"
			},
			{
				"indexed": false,
				"internalType": "int32",
				"name": "latitudeE6",
				"type": "int32"
			},
			{
				"indexed": false,
				"internalType": "int32",
				"name": "longitudeE6",
				"type": "int32"
			}
		],
		"name": "PropertyRegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "verifier",
				"type": "address"
			}
		],
		"name": "PropertyVerified",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "proposeTransfer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "recoverOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "initialOwner",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "metadataHash",
				"type": "bytes32"
			},
			{
				"internalType": "uint64",
				"name": "area",
				"type": "uint64"
			},
			{
				"internalType": "int32",
				"name": "latitudeE6",
				"type": "int32"
			},
			{
				"internalType": "int32",
				"name": "longitudeE6",
				"type": "int32"
			}
		],
		"name": "registerProperty",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "callerConfirmation",
				"type": "address"
			}
		],
		"name": "renounceRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "revokeRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "previousAdminRole",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "newAdminRole",
				"type": "bytes32"
			}
		],
		"name": "RoleAdminChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "RoleGranted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "RoleRevoked",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "TransferAccepted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "pendingOwner",
				"type": "address"
			}
		],
		"name": "TransferCancelled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "currentOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "pendingOwner",
				"type": "address"
			}
		],
		"name": "TransferProposed",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "unpause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Unpaused",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "newMetadataHash",
				"type": "bytes32"
			}
		],
		"name": "updatePropertyMetadata",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "reason",
				"type": "bytes32"
			}
		],
		"name": "VerificationReset",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			}
		],
		"name": "verifyProperty",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "DEFAULT_ADMIN_ROLE",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "EMERGENCY_ROLE",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "getPropertiesByOwner",
		"outputs": [
			{
				"internalType": "bytes32[]",
				"name": "",
				"type": "bytes32[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			}
		],
		"name": "getProperty",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "owner",
						"type": "address"
					},
					{
						"internalType": "bytes32",
						"name": "metadataHash",
						"type": "bytes32"
					},
					{
						"internalType": "bool",
						"name": "verified",
						"type": "bool"
					},
					{
						"internalType": "address",
						"name": "pendingOwner",
						"type": "address"
					},
					{
						"internalType": "uint64",
						"name": "area",
						"type": "uint64"
					},
					{
						"internalType": "int32",
						"name": "latitudeE6",
						"type": "int32"
					},
					{
						"internalType": "int32",
						"name": "longitudeE6",
						"type": "int32"
					},
					{
						"internalType": "uint64",
						"name": "createdAt",
						"type": "uint64"
					},
					{
						"internalType": "uint64",
						"name": "updatedAt",
						"type": "uint64"
					}
				],
				"internalType": "struct LandRegistry.Property",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			}
		],
		"name": "getRoleAdmin",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "hasRole",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			}
		],
		"name": "isVerified",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "LEGAL_ROLE",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			}
		],
		"name": "ownerOf",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "paused",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			}
		],
		"name": "pendingOwnerOf",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "propertyCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "propertyId",
				"type": "bytes32"
			}
		],
		"name": "propertyExists",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "REGISTRAR_ROLE",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "VERIFIER_ROLE",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] as const;
