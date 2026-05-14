// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "solady/src/tokens/ERC20.sol";

contract Solady is ERC20{

    function name() public pure override returns (string memory) {
        return "MyToken";
    }

    function symbol() public pure override returns (string memory) {
        return "MT";
    }

      function mintPublic(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burnPublic(address from, uint256 amount) external {
        _burn(from, amount);
    }
}
