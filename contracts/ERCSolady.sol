// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "solady/src/tokens/ERC20.sol";

contract Solady is ERC20{
     //keccak256("MyToken")
    bytes32 internal constant _NAME_HASH =
        0x245c734e6d4ec044daf7beffa09d54d4bafba490113c199734d790b04a7390e5;

    // keccak256("1")
    bytes32 internal constant _VERSION_HASH =
        0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6;

    function name() public pure override returns (string memory) {
        return "MyToken";
    }

    function symbol() public pure override returns (string memory) {
        return "MT";
    }

    function _constantNameHash() internal pure override returns (bytes32) {
        return _NAME_HASH;
    }

    function _versionHash() internal pure override returns (bytes32) {
        return _VERSION_HASH;
    }

      function mintPublic(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burnPublic(address from, uint256 amount) external {
        _burn(from, amount);
    }
}