predicate;

use std::tx::{
    tx_witness_data,
    tx_witnesses_count,
    tx_id
};
use std::{
    b512::B512,
    ecr::ec_recover_address,
    outputs::{
        Output,
        output_amount,
        output_asset_id,
        output_asset_to,
    },
};

configurable {
    ADDRESS_ONE: b256 = 0x9c2a3259a1d430be3aeff83d698b80ade6d9a2b1784f70a8b901e0ccd3333f9a, // contract id
    ADDRESS_TWO: b256 = 0x9c2a3259a1d430be3aeff83d698b80ade6d9a2b1784f70a8b901e0ccd3333f9a, // dummy addresses
    ADDRESS_THREE: b256 = 0x9c2a3259a1d430be3aeff83d698b80ade6d9a2b1784f70a8b901e0ccd3333f9a,
    REQUIRED_SIGNATURES: u64 = 2,
    AMOUNT: u64 = 0,
    ASSET: ContractId = ContractId::from(0x9c2a3259a1d430be3aeff83d698b80ade6d9a2b1784f70a8b901e0ccd3333f9a), // dummy asset
    RECEIVER: Address = Address::from(0x9c2a3259a1d430be3aeff83d698b80ade6d9a2b1784f70a8b901e0ccd3333f9a), // dummy receiver
}

fn main() -> bool {    
    let key_addresses = [
        ADDRESS_ONE,
        ADDRESS_TWO,
        ADDRESS_THREE
    ]; 

    // Check all signatures are unique.
    let mut counts = [0, 0, 0];
    let mut valid_sigs = 0;
    let mut tx_signature_count = tx_witnesses_count();
    let msg_hash: b256 = tx_id();

    while tx_signature_count != 0 {
        let signature: B512 = tx_witness_data(tx_signature_count);
        // return the public key from the signatures
        let curr_address_signature = ec_recover_address(signature, msg_hash).unwrap();

        let mut i = 0;
        while i < 3 {
            if curr_address_signature.value == key_addresses[i] {
                counts[i] += 1;
                valid_sigs += 1;
            }
            i += 1;
        }
    }

    if counts[0] <= 1 && counts[1] <= 1 && counts[2] <= 1 {
        if valid_sigs >= REQUIRED_SIGNATURES {
            // check if the amount and receiver are the correct ones
            let output_index = 0; // the first signer is always the contract, funds received from.
            let to = Address::from(output_asset_to(output_index).unwrap());
            let asset_id = output_asset_id(output_index).unwrap();
            let amount = output_amount(output_index);
            // check if correct
            ( to == RECEIVER) && (amount == AMOUNT) && (asset_id == ASSET);
            return true;
        }
    }
    return false;
}