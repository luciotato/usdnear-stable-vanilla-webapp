//----------------------------------
// NEP-141 smart-contract proxy
// https://github.com/near/NEPs/issues/141
//----------------------------------

import {ntoy,yton} from "../util/conversions.js"
import {SmartContract} from "../wallet-api/base-sc.js"

//extendable NEP-141 standard
export class Nep141 extends SmartContract {

    /// Returns the total supply of the token.
    ft_total_supply() : Promise<string> {
        return this.view("ft_total_supply")
    }

    /// Returns the balance of the given account ID. Returns 0 if the account doesn't exist.
    ft_balance_of(account_id: string ) : Promise<string> {
        return this.view("ft_balance_of",{account_id:account_id})
    }
    
    //trasnfer tokens to another user
    ft_transfer(receiver_id:string, amount:number, memo?:string) : Promise<void> {
        return this.call("ft_transfer", {
                receiver_id:receiver_id, 
                amount:ntoy(amount),
                memo:memo||null
            })
    }

    //trasnfer tokens to a contract
    ft_transfer_call(receiver_id:string, amount:number, msg:string, memo?:string) : Promise<void> {
        return this.call("ft_transfer_call", {
                receiver_id:receiver_id, 
                amount:ntoy(amount),
                msg:msg,
                memo:memo
            })
    }

}

