const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Gas Benchmark", function () {
    this.timeout(0);

    const initialSupply = ethers.parseEther("1000");
    const OPS = 1_000_000;

    let owner, user1, user2;
    let token;

    before(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const Factory = await ethers.getContractFactory("Solady");
        token = await Factory.deploy();
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
    describe("transfer", function () {
        it("runs 1 million transfers and reports gas + USD", async function () {
            let gasTotal = 0n;

            for (let i = 0; i < OPS; i++) {
                const tx = await token.transfer(user1.address, 1n);
                const receipt = await tx.wait();
                gasTotal += receipt.gasUsed;
            }

            printCost("transfer", gasTotal);
        });
    });

    // ------------------------------------------------------------
    // transferFrom — 100% normal
    // ------------------------------------------------------------
    describe("transferFrom: 100% normal", function () {
        it("runs 1 million transferFrom operations + USD", async function () {
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
    describe("transferFrom: 99% normal / 1% special", function () {
        it("runs 1 million transferFrom operations with 1% special cases + USD", async function () {
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
    describe("mintPublic", function () {
        it("runs 1 million mintPublic operations + USD", async function () {
            let gasTotal = 0n;

            for (let i = 0; i < OPS; i++) {
                const tx = await token.mintPublic(user1.address, 1n);
                const receipt = await tx.wait();
                gasTotal += receipt.gasUsed;
            }

            printCost("mintPublic", gasTotal);
        });
    });

    // ------------------------------------------------------------
    // burnPublic — 100% normal
    // ------------------------------------------------------------
    describe("burnPublic", function () {
        it("runs 1 million burnPublic operations + USD", async function () {
            // mint tokens to burn
            await token.mintPublic(owner.address, OPS);

            let gasTotal = 0n;

            for (let i = 0; i < OPS; i++) {
                const tx = await token.burnPublic(owner.address, 1n);
                const receipt = await tx.wait();
                gasTotal += receipt.gasUsed;
            }

            printCost("burnPublic", gasTotal);
        });
    });

    // ------------------------------------------------------------
    // approve — 100% normal
    // ------------------------------------------------------------
    describe("approve", function () {
        it("runs 1 million approve operations + USD", async function () {
            let gasTotal = 0n;

            for (let i = 0; i < OPS; i++) {
                const tx = await token.approve(user1.address, i + 1);
                const receipt = await tx.wait();
                gasTotal += receipt.gasUsed;
            }

            printCost("approve", gasTotal);
        });
    });
});
