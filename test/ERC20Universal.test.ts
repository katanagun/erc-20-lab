const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Universal ERC20 Tests", function () {
    const initialSupply = 1000n;

    async function deploy(Token, args) {
        const [owner, user1, user2] = await ethers.getSigners();
        const token = await ethers.deployContract(Token, args);

        // Универсальный способ выдать начальный supply
        if (token.mintPublic) {
            await token.mintPublic(owner.address, initialSupply);
        } else if (token.mint) {
            await token.mint(owner.address, initialSupply);
        } else {
            throw new Error(`Token ${Token} must implement mintPublic or mint`);
        }

        return { token, owner, user1, user2 };
    }

    const TOKENS = [
        { Token: "Solady", args: ["MyToken", "MT"] },
        { Token: "OpenZeppelin", args: ["MyToken", "MT"] },
        { Token: "Solmate", args: ["MyToken", "MT", 18] },
        { Token: "Maple", args: ["MyToken", "MT", 18] }
    ];

    for (const { Token, args } of TOKENS) {
        describe(Token, function () {
            beforeEach(async function () {
                Object.assign(this, await deploy(Token, args));
            });

            // -----------------------------
            // Metadata
            // -----------------------------
            it("has a name", async function () {
                const name = await this.token.name();
                expect(name).to.be.a("string");
                expect(name.length).to.be.greaterThan(0);
            });

            it("has a symbol", async function () {
                const symbol = await this.token.symbol();
                expect(symbol).to.be.a("string");
                expect(symbol.length).to.be.greaterThan(0);
            });

            it("has decimals", async function () {
                const decimals = await this.token.decimals();
                expect(typeof decimals === "number" || typeof decimals === "bigint").to.equal(true);
            });

            it("initial supply assigned to owner", async function () {
                expect(await this.token.totalSupply()).to.equal(initialSupply);
                expect(await this.token.balanceOf(this.owner.address)).to.equal(initialSupply);
            });

            describe("mint", function () {
                it("mints tokens", async function () {
                    const amount = 500n;
                    const mintFn = this.token.mintPublic || this.token.mint;
                    await mintFn(this.user1.address, amount);
                    
                    expect(await this.token.balanceOf(this.user1.address)).to.equal(amount);
                });

                it("emits Transfer event (mint)", async function () {
                    const amount = 123n;
                    const mintFn = this.token.mintPublic || this.token.mint;
                    
                    await expect(mintFn(this.user2.address, amount))
                        .to.emit(this.token, "Transfer")
                        .withArgs(ethers.ZeroAddress, this.user2.address, amount);
                });

                it("increases total supply", async function () {
                    const amount = 100n;
                    const oldSupply = await this.token.totalSupply();
                    const mintFn = this.token.mintPublic || this.token.mint;
                    
                    await mintFn(this.user1.address, amount);
                    expect(await this.token.totalSupply()).to.equal(oldSupply + amount);
                });
            });

            describe("burn", function () {
                it("burns tokens", async function () {
                    const amount = 100n;
                    const burnFn = this.token.burnPublic || this.token.burn;
                    
                    await burnFn(this.owner.address, amount);
                    expect(await this.token.balanceOf(this.owner.address)).to.equal(initialSupply - amount);
                });

                it("emits Transfer event (burn)", async function () {
                    const amount = 50n;
                    const burnFn = this.token.burnPublic || this.token.burn;
                    
                    await expect(burnFn(this.owner.address, amount))
                        .to.emit(this.token, "Transfer")
                        .withArgs(this.owner.address, ethers.ZeroAddress, amount);
                });

                it("reverts on insufficient balance (burn)", async function () {
                    const burnFn = this.token.burnPublic || this.token.burn;
                    await expect(
                        burnFn(this.user1.address, 1n)
                    ).to.be.reverted;
                });

                it("decreases total supply", async function () {
                    const amount = 10n;
                    const oldSupply = await this.token.totalSupply();
                    const burnFn = this.token.burnPublic || this.token.burn;
                    
                    await burnFn(this.owner.address, amount);
                    expect(await this.token.totalSupply()).to.equal(oldSupply - amount);
                });
            });

            // -----------------------------
            // Transfer
            // -----------------------------
            describe("transfer", function () {
                it("transfers tokens", async function () {
                    await this.token.transfer(this.user1.address, 100n);
                    expect(await this.token.balanceOf(this.user1.address)).to.equal(100n);
                });

                it("emits Transfer event", async function () {
                    await expect(this.token.transfer(this.user1.address, 50n))
                        .to.emit(this.token, "Transfer")
                        .withArgs(this.owner.address, this.user1.address, 50n);
                });

                it("transfer zero tokens", async function () {
                    await this.token.transfer(this.user1.address, 0n);
                    expect(await this.token.balanceOf(this.user1.address)).to.equal(0n);
                });

                it("transfer to self", async function () {
                    await this.token.transfer(this.owner.address, 10n);
                    expect(await this.token.balanceOf(this.owner.address)).to.equal(initialSupply);
                });

                it("reverts on insufficient balance", async function () {
                    await expect(
                        this.token.connect(this.user1).transfer(this.owner.address, 1n)
                    ).to.be.reverted;
                });

                it("totalSupply unchanged after transfer", async function () {
                    await this.token.transfer(this.user1.address, 10n);
                    expect(await this.token.totalSupply()).to.equal(initialSupply);
                });
            });

            // -----------------------------
            // Approve + Allowance
            // -----------------------------
            describe("approve + allowance", function () {
                it("sets allowance", async function () {
                    await this.token.approve(this.user1.address, 200n);
                    expect(await this.token.allowance(this.owner.address, this.user1.address)).to.equal(200n);
                });

                it("approve zero", async function () {
                    await this.token.approve(this.user1.address, 0n);
                    expect(await this.token.allowance(this.owner.address, this.user1.address)).to.equal(0n);
                });

                it("approve overwrite", async function () {
                    await this.token.approve(this.user1.address, 100n);
                    await this.token.approve(this.user1.address, 50n);
                    expect(await this.token.allowance(this.owner.address, this.user1.address)).to.equal(50n);
                });

                it("approve self", async function () {
                    await this.token.approve(this.owner.address, 123n);
                    expect(await this.token.allowance(this.owner.address, this.owner.address)).to.equal(123n);
                });

                it("emits Approval event", async function () {
                    await expect(this.token.approve(this.user1.address, 123n))
                        .to.emit(this.token, "Approval")
                        .withArgs(this.owner.address, this.user1.address, 123n);
                });
            });

            // -----------------------------
            // transferFrom
            // -----------------------------
            describe("transferFrom", function () {
                it("works with allowance", async function () {
                    await this.token.approve(this.user1.address, 200n);
                    await this.token.connect(this.user1).transferFrom(this.owner.address, this.user2.address, 50n);
                    expect(await this.token.balanceOf(this.user2.address)).to.equal(50n);
                });

                it("reverts without allowance", async function () {
                    await expect(
                        this.token.connect(this.user1).transferFrom(this.owner.address, this.user2.address, 1n)
                    ).to.be.reverted;
                });

                it("reverts with insufficient allowance", async function () {
                    await this.token.approve(this.user1.address, 10n);
                    await expect(
                        this.token.connect(this.user1).transferFrom(this.owner.address, this.user2.address, 11n)
                    ).to.be.reverted;
                });

                it("transferFrom to self", async function () {
                    await this.token.approve(this.user1.address, 100n);
                    await this.token.connect(this.user1).transferFrom(this.owner.address, this.owner.address, 50n);
                    expect(await this.token.balanceOf(this.owner.address)).to.equal(initialSupply);
                });

                it("transferFrom amount 0", async function () {
                    await this.token.approve(this.user1.address, 100n);

                    const owner = await this.owner.getAddress();
                    const user2 = await this.user2.getAddress();

                    const tx = await this.token
                        .connect(this.user1)
                        .transferFrom(owner, user2, 0n);

                    await expect(tx)
                        .to.emit(this.token, "Transfer")
                        .withArgs(owner, user2, 0n);

                    // Balances do not changed
                    expect(await this.token.balanceOf(owner)).to.equal(initialSupply);
                    expect(await this.token.balanceOf(user2)).to.equal(0n);
                });


                it("emits Transfer event", async function () {
                    await this.token.approve(this.user1.address, 100n);
                    await expect(
                        this.token.connect(this.user1).transferFrom(this.owner.address, this.user2.address, 50n)
                    ).to.emit(this.token, "Transfer")
                     .withArgs(this.owner.address, this.user2.address, 50n);
                });

                it("max allowance does not decrease", async function () {
                    const MAX = ethers.MaxUint256;
                    await this.token.approve(this.user1.address, MAX);
                    await this.token.connect(this.user1).transferFrom(this.owner.address, this.user2.address, 10n);
                    expect(await this.token.allowance(this.owner.address, this.user1.address)).to.equal(MAX);
                });
            });
        });
    }
});
