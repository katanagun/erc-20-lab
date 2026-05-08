import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000
      },
      evmVersion: "shanghai"
    }
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    noColors: false,
    forceTerminal: true
  }
};

export default config;