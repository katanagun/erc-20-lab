// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.4;

import { ERC20 } from "./ERCMaple.sol";

contract Maple is ERC20 {

    constructor(string memory name_, string memory symbol_, uint8 decimals_) ERC20(name_, symbol_, decimals_) {}

      function mintPublic(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burnPublic(address from, uint256 amount) external {
        _burn(from, amount);
    }

}