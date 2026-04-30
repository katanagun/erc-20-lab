const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Gas Benchmark — Single Implementation", function () {
    this.timeout(0);

    const initialSupply = ethers.parseEther("1000");
    const OPS = 100_000;

    let owner, user1, user2;
    let token;

    before(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const Factory = await ethers.getContractFactory("Solady");
        token = await Factory.deploy("MyToken", "MT");
        await token.mintPublic(owner.address, initialSupply);
    });

    function printCost(title, gasTotal) {
        const avg = Number(gasTotal) / OPS;

        const usd30 = (Number(gasTotal) * 30 * 1e-9 * 2000).toFixed(2);
        const usd100 = (Number(gasTotal) * 100 * 1e-9 * 2000).toFixed(2);

        console.log(`\n===== ${title} =====`);
        console.log(`Total gas: ${gasTotal.toLocaleString()}`);
        console.log(`Avg gas:   ${avg.toFixed(0)}`);
        console.log(`Cost @30 gwei:  $${usd30}`);
        console.log(`Cost @100 gwei: $${usd100}`);
    }

    // ------------------------------------------------------------
    // transfer — 100% normal
    // ------------------------------------------------------------
    describe("Scenario A — transfer: 100% normal", function () {
        it("runs 100k transfers and reports gas + USD", async function () {
            let gasTotal = 0n;

            for (let i = 0; i < OPS; i++) {
                const tx = await token.transfer(user1.address, 1n);
                const receipt = await tx.wait();
                gasTotal += receipt.gasUsed;
            }

            printCost("transfer (100% normal)", gasTotal);
        });
    });

    // ------------------------------------------------------------
    // transferFrom — 100% normal
    // ------------------------------------------------------------
    describe("Scenario A — transferFrom: 100% normal", function () {
        it("runs 100k transferFrom operations + USD", async function () {
            await token.approve(user1.address, ethers.MaxUint256);

            let gasTotal = 0n;

            for (let i = 0; i < OPS; i++) {
                const tx = await token.connect(user1).transferFrom(owner.address, user2.address, 1n);
                const receipt = await tx.wait();
                gasTotal += receipt.gasUsed;
            }

            printCost("transferFrom (100% normal)", gasTotal);
        });
    });

    // ------------------------------------------------------------
    // transferFrom — 99% normal / 1% special
    // ------------------------------------------------------------
    describe("Scenario B — transferFrom: 99% normal / 1% special", function () {
        it("runs 100k transferFrom operations with 1% special cases + USD", async function () {
            await token.approve(user1.address, ethers.MaxUint256);

            const specialOps = Math.floor(OPS / 100);
            const normalOps = OPS - specialOps;

            let gasTotal = 0n;

            for (let i = 0; i < normalOps; i++) {
                const tx = await token.connect(user1).transferFrom(owner.address, user2.address, 1n);
                const receipt = await tx.wait();
                gasTotal += receipt.gasUsed;
            }

            for (let i = 0; i < specialOps; i++) {
                const tx = await token.connect(user1).transferFrom(owner.address, owner.address, 0n);
                const receipt = await tx.wait();
                gasTotal += receipt.gasUsed;
            }

            printCost("transferFrom (99% normal / 1% special)", gasTotal);
        });
    });

    // ------------------------------------------------------------
    // mintPublic — 100% normal
    // ------------------------------------------------------------
    describe("Scenario A — mintPublic: 100% normal", function () {
        it("runs 100k mintPublic operations + USD", async function () {
            let gasTotal = 0n;

            for (let i = 0; i < OPS; i++) {
                const tx = await token.mintPublic(user1.address, 1n);
                const receipt = await tx.wait();
                gasTotal += receipt.gasUsed;
            }

            printCost("mintPublic (100% normal)", gasTotal);
        });
    });

    // ------------------------------------------------------------
    // burnPublic — 100% normal
    // ------------------------------------------------------------
    describe("Scenario A — burnPublic: 100% normal", function () {
        it("runs 100k burnPublic operations + USD", async function () {
            // mint tokens to burn
            await token.mintPublic(owner.address, OPS);

            let gasTotal = 0n;

            for (let i = 0; i < OPS; i++) {
                const tx = await token.burnPublic(owner.address, 1n);
                const receipt = await tx.wait();
                gasTotal += receipt.gasUsed;
            }

            printCost("burnPublic (100% normal)", gasTotal);
        });
    });

    // ------------------------------------------------------------
    // approve — 100% normal
    // ------------------------------------------------------------
    describe("Scenario A — approve: 100% normal", function () {
        it("runs 100k approve operations + USD", async function () {
            let gasTotal = 0n;

            for (let i = 0; i < OPS; i++) {
                const tx = await token.approve(user1.address, i + 1);
                const receipt = await tx.wait();
                gasTotal += receipt.gasUsed;
            }

            printCost("approve (100% normal)", gasTotal);
        });
    });
});
