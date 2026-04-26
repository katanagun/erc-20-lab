import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-vyper";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  vyper: {
      version: "0.2.4"
      },
  gasReporter: {
    enabled: true,
    currency: "USD",
    noColors: false,
    forceTerminal: true
  }
};

export default config;
