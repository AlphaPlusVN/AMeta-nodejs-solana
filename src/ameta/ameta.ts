export type Ameta = {
  "version": "0.1.0",
  "name": "ameta",
  "instructions": [
    {
      "name": "initializeGame",
      "accounts": [
        {
          "name": "aMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aMetaMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "AMetaData"
          }
        }
      ]
    },
    {
      "name": "updateGame",
      "accounts": [
        {
          "name": "aMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "aMetaMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "AMetaData"
          }
        }
      ]
    },
    {
      "name": "buyBox",
      "accounts": [
        {
          "name": "aMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "boxMint",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ownerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "creatorBump",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "boxCode",
          "type": "string"
        }
      ]
    },
    {
      "name": "openBox",
      "accounts": [
        {
          "name": "aMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "boxMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "boxTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fishingRodMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ownerVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "creatorBump",
          "type": "u8"
        },
        {
          "name": "fishingRodUri",
          "type": "string"
        },
        {
          "name": "fishingRodName",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeStarterAccount",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "aMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "starterAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "userName",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeRentSystem",
      "accounts": [
        {
          "name": "aMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rentSystem",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rentSystemTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ownerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "makeNewFishingRodRent",
      "accounts": [
        {
          "name": "aMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rentSystem",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "fishingRodForRent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fishingRodOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fishingRodRentContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolFishingRod",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "profit",
          "type": "u8"
        }
      ]
    },
    {
      "name": "rentFishingRod",
      "accounts": [
        {
          "name": "aMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "renter",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "fishingRodRentContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fishingRodForRent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "aMeta",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "wallet",
            "type": "publicKey"
          },
          {
            "name": "data",
            "type": {
              "defined": "AMetaData"
            }
          },
          {
            "name": "tokenAccount",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "rentContract",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "nftAddress",
            "type": "publicKey"
          },
          {
            "name": "status",
            "type": "string"
          },
          {
            "name": "profit",
            "type": "u8"
          },
          {
            "name": "renter",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "rentSystem",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rentSystemTokenAccount",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "starterAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "userName",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "wallet",
            "type": "publicKey"
          },
          {
            "name": "createdDate",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "AMetaData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "symbol",
            "type": "string"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotOwnerNFT",
      "msg": "Not Owner NFT"
    },
    {
      "code": 6001,
      "name": "InvalidBoxCode",
      "msg": "Invalid box code"
    },
    {
      "code": 6002,
      "name": "InvalidFishingRod",
      "msg": "Invalid fishing rod"
    },
    {
      "code": 6003,
      "name": "RentContractNotAvailable",
      "msg": "Rent Contract not available"
    },
    {
      "code": 6004,
      "name": "InvalidTokenAccount",
      "msg": "Invalid token account"
    },
    {
      "code": 6005,
      "name": "InvalidOwnerTokenAccount",
      "msg": "Invalid owner account"
    },
    {
      "code": 6006,
      "name": "NotEnoughToken",
      "msg": "Not enough ameta token"
    },
    {
      "code": 6007,
      "name": "InvalidMint",
      "msg": "Invalid mint"
    }
  ]
};

export const IDL: Ameta = {
  "version": "0.1.0",
  "name": "ameta",
  "instructions": [
    {
      "name": "initializeGame",
      "accounts": [
        {
          "name": "aMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "aMetaMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "AMetaData"
          }
        }
      ]
    },
    {
      "name": "updateGame",
      "accounts": [
        {
          "name": "aMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "aMetaMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "AMetaData"
          }
        }
      ]
    },
    {
      "name": "buyBox",
      "accounts": [
        {
          "name": "aMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "boxMint",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ownerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "creatorBump",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "boxCode",
          "type": "string"
        }
      ]
    },
    {
      "name": "openBox",
      "accounts": [
        {
          "name": "aMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "boxMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "boxTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fishingRodMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ownerVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "creatorBump",
          "type": "u8"
        },
        {
          "name": "fishingRodUri",
          "type": "string"
        },
        {
          "name": "fishingRodName",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeStarterAccount",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "aMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "starterAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "userName",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeRentSystem",
      "accounts": [
        {
          "name": "aMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rentSystem",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rentSystemTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ownerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "makeNewFishingRodRent",
      "accounts": [
        {
          "name": "aMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rentSystem",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "fishingRodForRent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fishingRodOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fishingRodRentContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolFishingRod",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "profit",
          "type": "u8"
        }
      ]
    },
    {
      "name": "rentFishingRod",
      "accounts": [
        {
          "name": "aMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "renter",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "fishingRodRentContract",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fishingRodForRent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "aMeta",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "wallet",
            "type": "publicKey"
          },
          {
            "name": "data",
            "type": {
              "defined": "AMetaData"
            }
          },
          {
            "name": "tokenAccount",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "rentContract",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "nftAddress",
            "type": "publicKey"
          },
          {
            "name": "status",
            "type": "string"
          },
          {
            "name": "profit",
            "type": "u8"
          },
          {
            "name": "renter",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "rentSystem",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rentSystemTokenAccount",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "starterAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "userName",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "wallet",
            "type": "publicKey"
          },
          {
            "name": "createdDate",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "AMetaData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "symbol",
            "type": "string"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotOwnerNFT",
      "msg": "Not Owner NFT"
    },
    {
      "code": 6001,
      "name": "InvalidBoxCode",
      "msg": "Invalid box code"
    },
    {
      "code": 6002,
      "name": "InvalidFishingRod",
      "msg": "Invalid fishing rod"
    },
    {
      "code": 6003,
      "name": "RentContractNotAvailable",
      "msg": "Rent Contract not available"
    },
    {
      "code": 6004,
      "name": "InvalidTokenAccount",
      "msg": "Invalid token account"
    },
    {
      "code": 6005,
      "name": "InvalidOwnerTokenAccount",
      "msg": "Invalid owner account"
    },
    {
      "code": 6006,
      "name": "NotEnoughToken",
      "msg": "Not enough ameta token"
    },
    {
      "code": 6007,
      "name": "InvalidMint",
      "msg": "Invalid mint"
    }
  ]
};
