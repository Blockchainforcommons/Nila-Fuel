import * as _ from 'lodash'
import { Wallet, Provider,Predicate, getRandomB256 } from 'fuels';
import { CreditAbi__factory } from './types';

// import abiJson 
import { CreditpredicateAbi__factory } from './predicate_types/factories/CreditpredicateAbi__factory';
import { IdentityInput,AddressInput,ContractIdInput } from './types/CreditAbi';

// modern module syntax
export async function wallet(e, context, callback) {

  // contract id in local
  const CONTRACTID = '0x9c2a3259a1d430be3aeff83d698b80ade6d9a2b1784f70a8b901e0ccd3333f9a'

  // let e = {
  //   type: 100,
  //   duration: 3,
  //   SK: '0x03c1b740fdddbe67edae30443b969da79aa8c0d055486fe185b82f34a719c2ca',
  //   sponsors: '[{"business_name": "Arani Food Export", "pk": "fuel172tmgjslwr6cpteru7fw2qe0wprwfrz9mztcrfhefv6q8h69dtdsurwm6v", "name": "mr. Krishnan H", "phonenumber": "+31627257049"}, {"business_name": "Magarantham Ltd FPO", "pk": "fuel172tmgjslwr6cpteru7fw2qe0wprwfrz9mztcrfhefv6q8h69dtdsurwm6v", "name": "mr. Anandan Pandurangan", "phonenumber": "+316272570490"}]',
  //   amount: 0,
  //   rate: 0,
  //   phone: 'whatsapp:+31627257049'
  // }

  console.log('event', e);
  // connect to the network
  const provider = new Provider('http://127.0.0.1:4000/graphql');
  // receive the Private Key from the connected lambda (UNSAFE)
  const wallet = Wallet.fromPrivateKey(e['SK'], provider);
  // sponsor will simply sign the predicate, which then fulfulls transaction.
  const chainId = await provider.getChainId();
  //const bin = CreditpredicateAbi__factory.bin; // run typegen with --predicate flag
  const configurable = {
    ADDRESS_ONE: CONTRACTID, // receiver
    ADDRESS_TWO: getRandomB256(), // dummy addresses
    ADDRESS_THREE: getRandomB256(),
    REQUIRED_SIGNATURES: 2,
    AMOUNT: e['amount'],
    ASSET: e['asset'],
    RECEIVER: wallet.address,
  };
  const predicate = CreditpredicateAbi__factory.createInstance(chainId,provider);
  predicate.setData((
    configurable.ADDRESS_ONE,
    configurable.ADDRESS_TWO,
    configurable.ADDRESS_THREE,
    configurable.AMOUNT,
    configurable.ASSET,
    configurable.RECEIVER,
    configurable.REQUIRED_SIGNATURES
  ));
  console.log('predicate', predicate.address);

  // call borrow,repay or refinance
  if(e['type'] == 100) {
    // NOT POSSIBLE AT THIS TIME:
    // * borrower instantiates predicate (with own address as receiver)
    // * borrower send contract request to deposit funds to predicate address,
    // * contract matches predicate hex string to hardcoded hex string,
    // * contract deposits funds to predicate address,
    // * sponsor gives signature (ISSUE::as predicate can't be checked, sponsor can be unvetted identity)

    // ask contract to send funds to predicate address
    const contract = CreditAbi__factory.connect(CONTRACTID, wallet);
    let address: AddressInput = { value: predicate.address.toB256() };
    let asset: ContractIdInput = { value: e['asset']};
    let id: IdentityInput = { Address: address };
    const resp = contract.functions.borrow(e['amount'],e['rate'],asset,e['type'],e['duration'],id).call();
    console.log(resp);
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        input: address,
      }),
    };
    callback(null, response);
  } else if (e['type'] == 101){
    // sponsor found
    // * sign predicate
    const sign = await wallet.transfer(predicate.address,0);
    await sign.waitForResult();
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        input: 'success',
      }),
    };
    callback(null, response);
  }
}
