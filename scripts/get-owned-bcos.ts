require('dotenv').config();

const API_KEY = process.env.MORALIS_API_KEY;

import fs from 'fs'
import Moralis from 'moralis';

async function getTokenIdsOwnedBy(ownerAddress: string) {

    const response = await Moralis.EvmApi.nft.getWalletNFTs({
        "chain": "0x89",
        "format": "decimal",
        "excludeSpam": true,
        "normalizeMetadata": true,
        "tokenAddresses": [
            "0x0b64f40e8ed601e712c2f67d46e4b979a8168453"
        ],
        "mediaItems": false,
        "address": ownerAddress
    });

    const tokenIds = response.result.map(token => {
        return token.tokenId;
    });
    return tokenIds;
}

async function main() {
    await Moralis.start({
        apiKey: API_KEY
    });

    const owners = fs.readFileSync('./scripts/owners.csv').toString().split('\n')
    let finalResults = [{}];
    try {

        // const getTokenIdsTasks = owners.map(async (owner) => await getTokenIdsOwnedBy(owner))


        for (const tokenOwner of owners) {
            const ownedIds = await getTokenIdsOwnedBy(tokenOwner)
            finalResults.push({
                wallet: tokenOwner,
                tokens: ownedIds
            });

        }

        // const results = await Promise.all(getTokenIdsTasks)

        // const result = await getTokenIdsOwnedBy("0x339fa50f259868b33efd6db28e945790f74ee9be")

        console.log(JSON.stringify(finalResults));



    } catch (e) {
        console.error(e);
    }
}

main()