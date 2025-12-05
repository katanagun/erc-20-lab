import { bigint } from "hardhat/internal/core/params/argumentTypes";
import {loadFixture, ethers, expect} from "./setup";
import { PANIC_CODES } from "@nomicfoundation/hardhat-chai-matchers/panic";

import {
  shouldBehaveLikeERC20,
  shouldBehaveLikeERC20Transfer,
  shouldBehaveLikeERC20Approve,
} from "./ERCOpenZeppelin.behavior";

import { OpenZeppelin } from "../typechain-types";

const tokenName = "MyToken";
const tokenSymbol = "MT";
const initialSupply = 100n;

describe("ERC20", function () {
  async function fixture() {
    const accounts = await ethers.getSigners();
    const [holder, recipient] = accounts;

    const token = await ethers.deployContract("OpenZeppelin") as OpenZeppelin;
    await token.mintPublic(holder.address, initialSupply);

    return { accounts, holder, recipient, token };
  }

  beforeEach(async function () {
    Object.assign(this, await loadFixture(fixture));
  });

  shouldBehaveLikeERC20(initialSupply, {});

  it("has a name", async function () {
    expect(await this.token.name()).to.equal(tokenName);
  });

  it("has a symbol", async function () {
    expect(await this.token.symbol()).to.equal(tokenSymbol);
  });

  it("has 18 decimals", async function () {
    expect(await this.token.decimals()).to.equal(18n);
  });

  describe("mintPublic", function () {
    const value = 50n;

    it("rejects overflow", async function () {
      await expect(this.token.mintPublic(this.recipient.address, ethers.MaxUint256))
        .to.be.reverted;
    });

    describe("for a non zero account", function () {
      beforeEach("minting", async function () {
        this.tx = await this.token.mintPublic(this.recipient.address, value);
      });

      it("increments totalSupply", async function () {
        expect(await this.token.totalSupply()).to.equal(initialSupply + value);
      });

      it("increments recipient balance", async function () {
        await expect(this.tx).to.changeTokenBalance(this.token, this.recipient, value);
      });

      it("emits Transfer event", async function () {
        await expect(this.tx)
          .to.emit(this.token, "Transfer")
          .withArgs(ethers.ZeroAddress, this.recipient.address, value);
      });
    });
  });

  describe("burnPublic", function () {
    it("rejects a null account", async function () {
      await expect(this.token.burnPublic(ethers.ZeroAddress, 1n))
        .to.be.reverted;
    });

    describe("for a non zero account", function () {
      it("rejects burning more than balance", async function () {
        await expect(this.token.burnPublic(this.holder.address, initialSupply + 1n))
          .to.be.reverted;
      });

      const describeBurn = (description: string, value: bigint) => {
        describe(description, function () {
          beforeEach("burning", async function () {
            this.tx = await this.token.burnPublic(this.holder.address, value);
          });

          it("decrements totalSupply", async function () {
            expect(await this.token.totalSupply()).to.equal(initialSupply - value);
          });

          it("decrements holder balance", async function () {
            await expect(this.tx).to.changeTokenBalance(this.token, this.holder, -value);
          });

          it("emits Transfer event", async function () {
            await expect(this.tx)
              .to.emit(this.token, "Transfer")
              .withArgs(this.holder.address, ethers.ZeroAddress, value);
          });
        });
      };

      describeBurn("for entire balance", initialSupply);
      describeBurn("for less value than balance", initialSupply - 1n);
    });
  });

  describe("transfer", function () {
    beforeEach(function () {
      this.transfer = (to: string, value: bigint) =>
      this.token.connect(this.holder).transfer(to, value);
    });

    shouldBehaveLikeERC20Transfer(initialSupply);
  });

  describe("approve", function () {
    beforeEach(function () {
        this.approve = (owner: any, spender: string, value: bigint) =>
        this.token.connect(owner).approve(spender, value);
    });

    shouldBehaveLikeERC20Approve(initialSupply);
  });
});
