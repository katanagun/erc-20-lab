import { ethers } from "hardhat";
import { expect } from "chai";

export function shouldBehaveLikeERC20(initialSupply: bigint, opts: { forcedApproval?: boolean } = {}) {
  const { forcedApproval } = opts;

  beforeEach(async function () {
    [this.holder, this.recipient, this.other] = this.accounts;
  });

  it("total supply: returns the total token value", async function () {
    expect(await this.token.totalSupply()).to.equal(initialSupply);
  });

  describe("balanceOf", function () {
    it("returns zero when the requested account has no tokens", async function () {
      expect(await this.token.balanceOf(this.other.address)).to.equal(0n);
    });

    it("returns the total token value when the requested account has some tokens", async function () {
      expect(await this.token.balanceOf(this.holder.address)).to.equal(initialSupply);
    });
  });

  describe("transfer", function () {
    beforeEach(function () {
      this.transfer = (to: any, value: bigint) =>
        this.token.connect(this.holder).transfer(to, value);
    });

    shouldBehaveLikeERC20Transfer(initialSupply);
  });

  describe("transferFrom", function () {
    describe("when the token owner is not the zero address", function () {
      describe("when the recipient is not the zero address", function () {
        describe("when the spender has enough allowance", function () {
          beforeEach(async function () {
            await this.token.connect(this.holder).approve(this.recipient.address, initialSupply);
          });

          describe("when the token owner has enough balance", function () {
            const value = initialSupply;

            beforeEach(async function () {
              this.tx = await this.token
                .connect(this.recipient)
                .transferFrom(this.holder.address, this.other.address, value);
            });

            it("transfers the requested value", async function () {
              await expect(this.tx).to.changeTokenBalances(
                this.token,
                [this.holder, this.other],
                [-value, value]
              );
            });

            it("decreases the spender allowance", async function () {
              expect(await this.token.allowance(this.holder.address, this.recipient.address)).to.equal(0n);
            });

            it("emits a transfer event", async function () {
              await expect(this.tx).to.emit(this.token, "Transfer").withArgs(
                this.holder.address,
                this.other.address,
                value
              );
            });

            if (forcedApproval) {
              it("emits an approval event", async function () {
                await expect(this.tx)
                  .to.emit(this.token, "Approval")
                  .withArgs(
                    this.holder.address,
                    this.recipient.address,
                    await this.token.allowance(this.holder.address, this.recipient.address)
                  );
              });
            } else {
              it("does not emit an approval event", async function () {
                await expect(this.tx).to.not.emit(this.token, "Approval");
              });
            }
          });
        });
      });
    });
  });

  describe("approve", function () {
    beforeEach(function () {
      this.approve = (owner: any, spender: any, value: bigint) =>
        this.token.connect(owner).approve(spender, value);
    });

    shouldBehaveLikeERC20Approve(initialSupply);
  });
}

export function shouldBehaveLikeERC20Transfer(balance: bigint) {
  describe("when the recipient is not the zero address", function () {
    it("reverts when the sender does not have enough balance", async function () {
      const value = balance + 1n;
      await expect(this.transfer(this.recipient.address, value))
        .to.be.reverted;
    });

    describe("when the sender transfers all balance", function () {
      const value = balance;

      beforeEach(async function () {
        this.tx = await this.transfer(this.recipient.address, value);
      });

      it("transfers the requested value", async function () {
        await expect(this.tx).to.changeTokenBalances(this.token, [this.holder, this.recipient], [-value, value]);
      });

      it("emits a transfer event", async function () {
        await expect(this.tx).to.emit(this.token, "Transfer").withArgs(this.holder.address, this.recipient.address, value);
      });
    });
  });
}

export function shouldBehaveLikeERC20Approve(supply: bigint) {
  describe("when the spender is not the zero address", function () {
    const value = supply;

    it("emits an approval event", async function () {
      await expect(this.approve(this.holder, this.recipient.address, value))
        .to.emit(this.token, "Approval")
        .withArgs(this.holder.address, this.recipient.address, value);
    });

    it("approves the requested value", async function () {
      await this.approve(this.holder, this.recipient.address, value);
      expect(await this.token.allowance(this.holder.address, this.recipient.address)).to.equal(value);
    });
  });
}
