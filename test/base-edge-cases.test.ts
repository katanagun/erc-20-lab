const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Scenario 4 — Baseline Solady: High share of edge cases (90% regular, 5% self, 5% zero)", function () {
    const initialSupply = ethers.parseEther("1000");
    const TOTAL_OPS = 1_000; // Use 100_000 for final report

    let owner, user1, user2;
    let solady;

    before(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy baseline Solady (without optimizations)
        const Solady = await ethers.getContractFactory("Solady");
        solady = await Solady.deploy("SoladyToken", "SLD");
        await solady.mintPublic(owner.address, initialSupply);
    });

    // -----------------------------
    // transfer — Scenario 4 (Baseline)
    // -----------------------------
    describe("transfer (90% regular / 5% self / 5% zero)", function () {
        it("simulates 1000 transfer operations and extrapolates to 100k", async function () {
            const normalCount = Math.floor(TOTAL_OPS * 0.90);
            const selfCount = Math.floor(TOTAL_OPS * 0.05);
            const zeroCount = TOTAL_OPS - normalCount - selfCount;

            let totalGasSolady = 0n;

            // Regular transfers
            for (let i = 0; i < normalCount; i++) {
                const tx = await solady.transfer(user1.address, 1n);
                const receipt = await tx.wait();
                totalGasSolady += receipt.gasUsed;
            }

            // Self-transfers
            for (let i = 0; i < selfCount; i++) {
                const tx = await solady.transfer(owner.address, 1n);
                const receipt = await tx.wait();
                totalGasSolady += receipt.gasUsed;
            }

            // Zero transfers
            for (let i = 0; i < zeroCount; i++) {
                const tx = await solady.transfer(user1.address, 0n);
                const receipt = await tx.wait();
                totalGasSolady += receipt.gasUsed;
            }

            console.log(`\n========== SCENARIO 4: Baseline Solady transfer (90% regular / 5% self / 5% zero) ==========`);
            console.log(`Total operations: ${TOTAL_OPS.toLocaleString()}`);
            console.log(`  Regular: ${normalCount.toLocaleString()}`);
            console.log(`  Self:    ${selfCount.toLocaleString()}`);
            console.log(`  Zero:    ${zeroCount.toLocaleString()}`);
            console.log(`-----------------------------------------------------------------`);
            console.log(`  Solady total gas:       ${totalGasSolady.toLocaleString()} gas`);
            console.log(`  Solady avg gas:         ${(Number(totalGasSolady) / TOTAL_OPS).toFixed(0)} gas`);

            const factor = 100_000 / TOTAL_OPS;
            const extrapolatedGas = totalGasSolady * BigInt(Math.floor(factor));

            const costUSD_30gwei = (Number(extrapolatedGas) * 30 * 1e-9 * 2000).toFixed(2);
            const costUSD_100gwei = (Number(extrapolatedGas) * 100 * 1e-9 * 2000).toFixed(2);

            console.log(`\n--------- EXTRAPOLATION TO 100 000 OPERATIONS ---------`);
            console.log(`  Total gas:               ${extrapolatedGas.toLocaleString()} gas`);
            console.log(`  Cost (USD, 30 Gwei):     $${costUSD_30gwei}`);
            console.log(`  Cost (USD, 100 Gwei):    $${costUSD_100gwei}`);
            console.log(`=================================================================\n`);
        });
    });

    // -----------------------------
    // transferFrom — Scenario 4 (Baseline)
    // -----------------------------
    describe("transferFrom (90% regular / 5% self / 5% zero)", function () {
        it("simulates 1000 transferFrom operations and extrapolates to 100k", async function () {
            await solady.approve(user1.address, ethers.MaxUint256);

            const normalCount = Math.floor(TOTAL_OPS * 0.90);
            const selfCount = Math.floor(TOTAL_OPS * 0.05);
            const zeroCount = TOTAL_OPS - normalCount - selfCount;

            let totalGasSolady = 0n;

            // Regular transferFrom
            for (let i = 0; i < normalCount; i++) {
                const tx = await solady.connect(user1).transferFrom(owner.address, user2.address, 1n);
                const receipt = await tx.wait();
                totalGasSolady += receipt.gasUsed;
            }

            // Self-transferFrom
            for (let i = 0; i < selfCount; i++) {
                const tx = await solady.connect(user1).transferFrom(owner.address, owner.address, 1n);
                const receipt = await tx.wait();
                totalGasSolady += receipt.gasUsed;
            }

            // Zero transferFrom
            for (let i = 0; i < zeroCount; i++) {
                const tx = await solady.connect(user1).transferFrom(owner.address, user2.address, 0n);
                const receipt = await tx.wait();
                totalGasSolady += receipt.gasUsed;
            }

            console.log(`\n========== SCENARIO 4: Baseline Solady transferFrom (90% regular / 5% self / 5% zero) ==========`);
            console.log(`Total operations: ${TOTAL_OPS.toLocaleString()}`);
            console.log(`  Regular: ${normalCount.toLocaleString()}`);
            console.log(`  Self:    ${selfCount.toLocaleString()}`);
            console.log(`  Zero:    ${zeroCount.toLocaleString()}`);
            console.log(`-----------------------------------------------------------------`);
            console.log(`  Solady total gas:       ${totalGasSolady.toLocaleString()} gas`);
            console.log(`  Solady avg gas:         ${(Number(totalGasSolady) / TOTAL_OPS).toFixed(0)} gas`);

            const factor = 100_000 / TOTAL_OPS;
            const extrapolatedGas = totalGasSolady * BigInt(Math.floor(factor));

            const costUSD_30gwei = (Number(extrapolatedGas) * 30 * 1e-9 * 2000).toFixed(2);
            const costUSD_100gwei = (Number(extrapolatedGas) * 100 * 1e-9 * 2000).toFixed(2);

            console.log(`\n--------- EXTRAPOLATION TO 100 000 OPERATIONS ---------`);
            console.log(`  Total gas:               ${extrapolatedGas.toLocaleString()} gas`);
            console.log(`  Cost (USD, 30 Gwei):     $${costUSD_30gwei}`);
            console.log(`  Cost (USD, 100 Gwei):    $${costUSD_100gwei}`);
            console.log(`=================================================================\n`);
        });
    });
});