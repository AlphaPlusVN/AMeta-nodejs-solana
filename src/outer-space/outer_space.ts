export type OuterSpace = {
  "version": "0.1.0",
  "name": "outer_space",
  "instructions": [
    {
      "name": "mintNftBox",
      "accounts": [
        {
          "name": "outerSpace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintAuthority",
          "isMut": false,
          "isSigner": true
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
          "name": "creatorBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeOuterSpace",
      "accounts": [
        {
          "name": "outerSpace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
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
            "defined": "OuterSpaceData"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "outerSpace",
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
              "defined": "OuterSpaceData"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "OuterSpaceData",
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
    },
    {
      "name": "ErrorCode",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "IncorrectOwner"
          },
          {
            "name": "Uninitialized"
          },
          {
            "name": "MintMismatch"
          },
          {
            "name": "IndexGreaterThanLength"
          },
          {
            "name": "NumericalOverflowError"
          },
          {
            "name": "TooManyCreators"
          },
          {
            "name": "UuidMustBeExactly6Length"
          },
          {
            "name": "NotEnoughTokens"
          },
          {
            "name": "NotEnoughSOL"
          },
          {
            "name": "TokenTransferFailed"
          },
          {
            "name": "CandyMachineEmpty"
          },
          {
            "name": "CandyMachineNotLive"
          },
          {
            "name": "HiddenSettingsConfigsDoNotHaveConfigLines"
          },
          {
            "name": "CannotChangeNumberOfLines"
          },
          {
            "name": "DerivedKeyInvalid"
          },
          {
            "name": "PublicKeyMismatch"
          },
          {
            "name": "NoWhitelistToken"
          },
          {
            "name": "TokenBurnFailed"
          },
          {
            "name": "GatewayAppMissing"
          },
          {
            "name": "GatewayTokenMissing"
          },
          {
            "name": "GatewayTokenExpireTimeInvalid"
          },
          {
            "name": "NetworkExpireFeatureMissing"
          },
          {
            "name": "CannotFindUsableConfigLine"
          },
          {
            "name": "InvalidString"
          },
          {
            "name": "SuspiciousTransaction"
          },
          {
            "name": "CannotSwitchToHiddenSettings"
          },
          {
            "name": "IncorrectSlotHashesPubkey"
          },
          {
            "name": "IncorrectCollectionAuthority"
          },
          {
            "name": "MismatchedCollectionPDA"
          },
          {
            "name": "MismatchedCollectionMint"
          }
        ]
      }
    }
  ]
};

export const IDL: OuterSpace = {
  "version": "0.1.0",
  "name": "outer_space",
  "instructions": [
    {
      "name": "mintNftBox",
      "accounts": [
        {
          "name": "outerSpace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "metadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintAuthority",
          "isMut": false,
          "isSigner": true
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
          "name": "creatorBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeOuterSpace",
      "accounts": [
        {
          "name": "outerSpace",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
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
            "defined": "OuterSpaceData"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "outerSpace",
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
              "defined": "OuterSpaceData"
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "OuterSpaceData",
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
    },
    {
      "name": "ErrorCode",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "IncorrectOwner"
          },
          {
            "name": "Uninitialized"
          },
          {
            "name": "MintMismatch"
          },
          {
            "name": "IndexGreaterThanLength"
          },
          {
            "name": "NumericalOverflowError"
          },
          {
            "name": "TooManyCreators"
          },
          {
            "name": "UuidMustBeExactly6Length"
          },
          {
            "name": "NotEnoughTokens"
          },
          {
            "name": "NotEnoughSOL"
          },
          {
            "name": "TokenTransferFailed"
          },
          {
            "name": "CandyMachineEmpty"
          },
          {
            "name": "CandyMachineNotLive"
          },
          {
            "name": "HiddenSettingsConfigsDoNotHaveConfigLines"
          },
          {
            "name": "CannotChangeNumberOfLines"
          },
          {
            "name": "DerivedKeyInvalid"
          },
          {
            "name": "PublicKeyMismatch"
          },
          {
            "name": "NoWhitelistToken"
          },
          {
            "name": "TokenBurnFailed"
          },
          {
            "name": "GatewayAppMissing"
          },
          {
            "name": "GatewayTokenMissing"
          },
          {
            "name": "GatewayTokenExpireTimeInvalid"
          },
          {
            "name": "NetworkExpireFeatureMissing"
          },
          {
            "name": "CannotFindUsableConfigLine"
          },
          {
            "name": "InvalidString"
          },
          {
            "name": "SuspiciousTransaction"
          },
          {
            "name": "CannotSwitchToHiddenSettings"
          },
          {
            "name": "IncorrectSlotHashesPubkey"
          },
          {
            "name": "IncorrectCollectionAuthority"
          },
          {
            "name": "MismatchedCollectionPDA"
          },
          {
            "name": "MismatchedCollectionMint"
          }
        ]
      }
    }
  ]
};
