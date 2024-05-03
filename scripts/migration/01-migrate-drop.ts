import "dotenv/config";
import fs from 'fs'
import { ethers } from 'ethers'

const artifact = require('../../artifacts/contracts/BoxedCatsv2.sol/BoxedCatsv2.json');
const tokenOwnership = require('./snapshot-token-ownership.json');

const ALCHEMY_KEY = process.env.ALCHEMY_KEY ?? "";
const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY ?? "";
const JSON_RPC_URL = `https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`;

const provider = new ethers.JsonRpcProvider(JSON_RPC_URL)
const contract = new ethers.Contract('0xbB682E61f87935D8F3b9723F19b2152701cF4b6c', artifact.abi, provider)
const signer = new ethers.Wallet(PRIVATE_KEY, provider)

async function main() {
    for (const to of tokenOwnership) {
        const { wallet, tokens } = to
        try {
            await contract.connect(signer).migrationDropBatch(wallet, tokens)
        } catch (error) {
            console.log('error at', wallet)
        }
    }
}

main()