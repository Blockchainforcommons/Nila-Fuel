contract;

/*
The Nila Credit protocol allows selected users (those with a prop NFT) to borrow liquidity in stablecoins (digital rupees or other.)
from duration pools. 

Lenders can supply liquidity to a duration pool and get paid interest over the income spread to the percentage of the total liquidity.

A multisig transaction is signed by the contract (borrow), and waits untill a whitelisted address has signed it before executing. The address is the vetted entity
that guaranteed the loan repay.

Pools exist in 2 type, either standard and refinanced. In the standard pool, a loan can only be repaid with the stablecoin distributed by the borrower. 
In case a borrower delinquishes, the amount is charged from the signed sponsor (vetted identity). The sponsor is notified 3 weeks after a harvest signal is detected by our remote sensing module. 

In a refinance pool, the borrower has the ability to refinance the loan by depositing overcollateralizing crop tokens to the pool. Supply financed pools only exist for crops with low perishability, such as grains, seeds and legumbes.
The crop tokens have to be signed - as stored - by a vetted entity, often the sponsor himself. In that case, the interest rate will be extended.
*/

mod interface;
mod errors;
mod oracle;

use ::interface::{NilaCredit};
use ::errors::Error;
use std::{
    call_frames::{
        msg_asset_id,
    },
    auth::msg_sender,
    context::msg_amount,
    token::transfer,
};

pub struct type_ {
    value: u64
}
pub struct duration_ {
    value: u64
}

configurable {
    MINIMUM_DEPOSIT: u64 = 1000, // test amount to 1000 rupees 
    MAXIMUM_DEPOSIT: u64 = 10000, // test amount to 10000 rupees 
    ORACLE_ID: b256 = 0x79fa8779bed2f36c3581d01c79df8da45eee09fac1fd76a5a656e16326317ef0, // test contract from oracle example
  }

storage {
    // contract bytecode root.
    contract_bytecode_root: Option<b256> = Option::None,
    // Map that stores pools, i.e., asset identifier pairs as keys and corresponding exchange contract identifiers as values.
    pools: StorageMap<(ContractId,u64), ContractId> = StorageMap {},
    // Map that stores the individual deposits
    deposits: StorageMap<(Identity,ContractId), u64> = StorageMap {},
    // Map that stores individual credits
    credits: StorageMap<(Identity,ContractId), (u64,u64,u64,str[3]) > = StorageMap {},
}

impl NilaCredit for Contract {
    #[storage(read, write)]
    fn initialize(contract_bytecode_root: ContractId ) {
        require(storage.contract_bytecode_root.read().is_none(), Error::BytecodeRootAlreadySet);
        storage.contract_bytecode_root.write(Option::Some(contract_bytecode_root.into()));
    }

    #[storage(write)]
    fn pool(asset: (ContractId),type_: u64, pool: ContractId) {
        storage.pools.insert((asset,type_), pool);
        // missing: reserves,liquidity asset in return
    }

    #[storage(read, write)]
    fn supply(type_: u64) {
        let mut sender = msg_sender().unwrap();
        let mut amount = msg_amount();
        let mut asset = msg_asset_id();
        require(storage.pools.get((asset,type_)).try_read().is_some(), Error:: PoolDoesNotExist);
        require(MINIMUM_DEPOSIT <= amount, Error::LessThenMinimum);
        require(MAXIMUM_DEPOSIT <= amount, Error::MoreThenMaxnmum);

        // store and tag the individual deposit 
        let updated_amount = storage.deposits.get((sender,asset)).try_read().unwrap() + amount;
        storage.deposits.insert((sender,asset), updated_amount);
    }

    #[storage(read, write)]
    fn withdraw() {        
        let mut sender = msg_sender().unwrap();
        let mut amount = msg_amount();
        let mut asset = msg_asset_id();
        let balance = storage.deposits.get((sender,asset)).try_read().unwrap();
        require(amount <= balance, Error:: MoreThenAvailable);
        
        // store and tag the individual deposit 
        let updated_amount = storage.deposits.get((sender,asset)).try_read().unwrap() - amount;
        storage.deposits.insert((sender,asset), updated_amount);

        // transfer available amount back to depositor
        transfer(amount, asset, sender);
    }

    #[storage(read, write)]
    fn borrow(amount: u64, rate: u64, asset: ContractId, _type: str[3], duration: u64, predicateaddress: Identity ) {
        // deposit the funds to the predicator address, store the outstanding amount
        let mut remuneration = (amount,rate,(amount * (rate/100)) * amount,"rep");
        // again need to read the predicate to make sure the borrower doesnt send in non-vetted addresses
        // https://forum.fuel.network/t/is-there-a-sway-library-to-point-to-predicate/2972/5
        let mut sender = msg_sender().unwrap();
        storage.credits.insert((sender,asset), remuneration);
        // borrow transaction needs to have a small fee
        transfer(amount,asset,predicateaddress);
    }

    #[storage(read,write)]
    fn repay() -> u64 {
        // simply repay - or partially repay - the outstanding amount  
        let mut sender = msg_sender().unwrap();
        let mut asset = msg_asset_id();
        let mut amount = msg_amount();
        //require(asset == '') /// check if asset is in digital rupee (testtoken)
        // find remuneration amount
        let credit = storage.credits.get((sender,asset)).try_read().unwrap();
        if amount >= credit.2 {
            // loan paid off. remove from storage
            storage.credits.remove((sender,asset));
            // find the sponsor account and remove aswell
            // TODO - find account of other signatures..
            0
        } else {
            // loan partially paid off, reset outstanding
            let mut new_outstanding = credit.2 - msg_amount();
            let mut remuneration = (credit.0,credit.1,new_outstanding,"rep");
            storage.credits.insert((sender,asset), remuneration);
            new_outstanding
        }
    }

    #[storage(read,write)]
    fn refinance(denom_asset: ContractId) {
        // request to refinance loan with crop tokens (test asset: (paddy))
        let tokens = msg_asset_id();
        let amount: u64 = msg_amount();
        let sender = msg_sender().unwrap();
        let outstanding = storage.credits.get((sender,denom_asset)).try_read().unwrap();
        // get value of token amount from oracle
        let x = abi(oracle::Oracle,ORACLE_ID);
        let price = x.receive(tokens);
        
        // verify the token value overcollateralization (150%)
        require(amount * price > outstanding.2 * (3/2), Error::InsufficientCollateral);
        // verify if the agreement is signed by a storage partner
        // TODO
        // verify the UTXO history 
        // TODO
        // deposited tokens in contract, update outstanding credit
        let mut new_outstanding = outstanding.2 - amount;
        let mut refinance = (outstanding.2,outstanding.1,amount,"ref");
        storage.credits.insert((sender,tokens), refinance);
    }
}
