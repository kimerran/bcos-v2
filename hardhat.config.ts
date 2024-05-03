import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const ALCHEMY_KEY = process.env.ALCHEMY_KEY ?? "";
const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY ?? "";

const config: HardhatUserConfig = {
  gasReporter: {
    enabled: true
  },
  networks: {
    sepolia: {
      url: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    arbsep: {
      url: `https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 421614,
    },
  },
  sourcify: {
    enabled: true,
  },
  etherscan: {
    apiKey: ARBISCAN_API_KEY,
    customChains: [
      {
        network: "arbsep",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io/",
        },
      },
    ],
  },
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          },
          metadata: {
            bytecodeHash: 'none'
          }
        }
      }
    ]
  },
};

export default config;
