//----------------------------------
// Meta Staking pool smart-contract proxy
// https://github.com/Narwallets/diversifying-staking-pool
//----------------------------------

import {Nep141} from "./NEP141.js"

//export const CONTRACT_ACCOUNT = "meta.pool.near" //mainnet
export const CONTRACT_ACCOUNT = "meta.pool.testnet"

//singleton export
export const metaPool = new Nep141(CONTRACT_ACCOUNT);
