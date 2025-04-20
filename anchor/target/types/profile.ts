/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/profile.json`.
 */
export type Profile = {
  "address": "CChCHZ73fCThaPfKJKjSJqmHxm9yubpCTEsu6ZmHAe4C",
  "metadata": {
    "name": "profile",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createUser",
      "discriminator": [
        108,
        227,
        130,
        130,
        252,
        109,
        75,
        218
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "fundRewardPool",
      "discriminator": [
        85,
        49,
        108,
        245,
        204,
        70,
        243,
        3
      ],
      "accounts": [
        {
          "name": "programTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "sourceTokenAccount",
          "writable": true
        },
        {
          "name": "sourceAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "selectProjectToVet",
      "discriminator": [
        145,
        118,
        226,
        222,
        106,
        25,
        180,
        221
      ],
      "accounts": [
        {
          "name": "project",
          "writable": true
        },
        {
          "name": "vetter",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "submitProject",
      "discriminator": [
        117,
        198,
        165,
        208,
        111,
        248,
        202,
        12
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "project",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "title"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "skills",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "projectLink",
          "type": "string"
        }
      ]
    },
    {
      "name": "submitValidation",
      "discriminator": [
        224,
        75,
        32,
        63,
        177,
        137,
        242,
        221
      ],
      "accounts": [
        {
          "name": "project",
          "writable": true
        },
        {
          "name": "vetter",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "project.owner",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenAccount",
          "writable": true
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "vetterTokenAccount1",
          "writable": true,
          "optional": true
        },
        {
          "name": "vetterTokenAccount2",
          "writable": true,
          "optional": true
        },
        {
          "name": "vetterTokenAccount3",
          "writable": true,
          "optional": true
        },
        {
          "name": "vetterAccount1",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "project.vetters [0]",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "vetterAccount2",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "project.vetters [1]",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "vetterAccount3",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "project.vetters [2]",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "penaltyAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "score",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updateUserProfile",
      "discriminator": [
        79,
        75,
        114,
        130,
        68,
        123,
        180,
        11
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "updatedSkills",
          "type": {
            "vec": "string"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "project",
      "discriminator": [
        205,
        168,
        189,
        202,
        181,
        247,
        142,
        19
      ]
    },
    {
      "name": "user",
      "discriminator": [
        159,
        117,
        95,
        227,
        239,
        151,
        58,
        236
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "insufficientFunds",
      "msg": "Insufficient funds for withdrawal"
    },
    {
      "code": 6001,
      "name": "vetterAlreadyAdded",
      "msg": "User already assigned to vetting"
    },
    {
      "code": 6002,
      "name": "notAssigned",
      "msg": "User not assigned to vetting"
    },
    {
      "code": 6003,
      "name": "invalidScore",
      "msg": "Invalid score"
    },
    {
      "code": 6004,
      "name": "vetterNotAuthorized",
      "msg": "Vetter not authorized for this project"
    },
    {
      "code": 6005,
      "name": "maxVettersReached",
      "msg": "Max vetters reached for this project"
    },
    {
      "code": 6006,
      "name": "unauthorized",
      "msg": "Unauthorized operation"
    },
    {
      "code": 6007,
      "name": "invalidTokenAccount",
      "msg": "Invalid token account ownership"
    },
    {
      "code": 6008,
      "name": "insufficientVetterAccounts",
      "msg": "Insufficient vetter token accounts provided"
    },
    {
      "code": 6009,
      "name": "projectAlreadyValidated",
      "msg": "Project has already been validated"
    },
    {
      "code": 6010,
      "name": "vetterTokenAccountNotFound",
      "msg": "Vetter token account not found in context"
    },
    {
      "code": 6011,
      "name": "vetterAlreadySubmittedScore",
      "msg": "Vetter has already submitted a score for this project"
    },
    {
      "code": 6012,
      "name": "invalidVetterAccount",
      "msg": "Invalid vetter account"
    },
    {
      "code": 6013,
      "name": "insufficientTokenBalance",
      "msg": "Insufficient token balance for rewards or penalties"
    },
    {
      "code": 6014,
      "name": "missingVetterTokenAccount",
      "msg": "Missing vetter token account"
    },
    {
      "code": 6015,
      "name": "invalidVetterCount",
      "msg": "Invalid number of vetters assigned to project"
    }
  ],
  "types": [
    {
      "name": "project",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "skills",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "projectLink",
            "type": "string"
          },
          {
            "name": "submissionTime",
            "type": "i64"
          },
          {
            "name": "scores",
            "type": {
              "vec": {
                "defined": {
                  "name": "score"
                }
              }
            }
          },
          {
            "name": "vetters",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "finalScore",
            "type": "u8"
          },
          {
            "name": "isValidated",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "score",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vetter",
            "type": "pubkey"
          },
          {
            "name": "score",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "rank",
            "type": "u8"
          },
          {
            "name": "skills",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "portfolio",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "rewardsEarned",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
