library;

abi NilaCredit {
    // type, duration (crops)
    #[storage(read, write)]
    fn initialize(contract_bytecode_root: ContractId);
    #[storage(write)]
    fn pool(asset: (ContractId),type_: u64, pool: ContractId);

    // supply/withdraw liquidity
    #[storage(read, write)] 
    fn supply(type_: u64);
    #[storage(read, write)]
    fn withdraw();
    // borrow
    #[storage(read, write)]
    fn borrow(amount: u64, rate: u64, asset: ContractId, _type: str[3], duration: u64, predicateaddress: Identity);
    // repay or refinance
    #[storage(read, write)]
    fn repay() -> u64;
    #[storage(read, write)]
    fn refinance(denom_asset: ContractId);
}