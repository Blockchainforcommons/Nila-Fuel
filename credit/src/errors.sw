library;

pub enum Error {
    PoolDoesNotExist: (), // "The pool does not exist.",
    LessThenMinimum: (), // "The deposit is less then the required minimum.",
    MoreThenMaxnmum: (), // "The deposit is more then the set maximum during the development phase.",
    WrongDurationPool: (), // "The crop cultivated duration does not match the pool conditions.",
    MoreThenAvailable: (), // "You tried to withdraw more funds than currently available in your account.",
    AddressNotWhitelisted: (), //"You are not whitelisted as sponsor for this agreement.",
    InsufficientCollateral: (), //"The collateral is insufficient to bear the refinancialization of the loan."
    BytecodeRootAlreadySet: (), //""
}
