contract;

use oracle::Oracle

impl Oracle for Contract {
    fn receive(type_: u64) -> u64 {
        return_50() // dummy 50 rupees per token
    }
}

fn return_50() -> u64 {
  50
}