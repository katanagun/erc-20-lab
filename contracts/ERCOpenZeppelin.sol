// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OpenZeppelin is ERC20{

  constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {

  }

    function mintPublic(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burnPublic(address from, uint256 amount) external {
        _burn(from, amount);
    }

}