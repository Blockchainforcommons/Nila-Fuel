import sys
sys.path.append("..")
from base64 import b64decode
from algosdk.v2client import algod, indexer
from typing import List, Dict, Any, Optional
import binascii
from Crypto.Cipher import AES
from algosdk import mnemonic, encoding
from algosdk.transaction import AssetTransferTxn, PaymentTxn
from algosdk import account
from algosdk.transaction import AssetOptInTxn,ApplicationOptInTxn, AssetTransferTxn, PaymentTxn

from datetime import datetime as dt, timedelta,timezone

mnemonic_phrase = 'feed canoe custom sunny chapter toss actor shoulder soup position outdoor october opera senior smile chair ginger uniform tobacco term soda shoe wish abstract exhaust'
SK = mnemonic.to_private_key(mnemonic_phrase)
PK = encoding.encode_address(b64decode(SK)[32:])
# root PK: DZLDJVFJUCX2C5H27U6AE5UL3KMCWX7Z37SIGJ4QAGIFHKEHKGRVQHECRI

algod_token = 'dFrf6mnFriaPIAzsbB70g3qZlWuXGeGO6z2nxCRw'
algod_address = 'https://testnet-algorand.api.purestake.io/ps2'
index_address = 'https://testnet-algorand.api.purestake.io/idx2'
purestake_token = {'X-Api-key': algod_token}
algodclient = algod.AlgodClient(algod_token, algod_address, headers=purestake_token)
chittaIndex = indexer.IndexerClient(algod_token, index_address, purestake_token)
suggestedParams = algodclient.suggested_params()

# creds for bin address
bin_key = {'addr': 'SQSWYZ5PBINYYVK2XPKTNG6K2HMU7GNI6XAI7KYVYKGKXAYAVOD4CONCKA', 'sk': 'blurkGxUZ24ePJQ+nx1f/uUnydEq2ZfIINb1JZikoQOUJWxnrwobjFVau9U2m8rR2U+ZqPXAj6sVwoyrgwCrhw=='}

def toMnemonic():
    print(mnemonic.from_private_key(''))

def encrypt_AES_GCM(msg, secretKey):    
  aesCipher = AES.new(secretKey, AES.MODE_GCM)    
  ciphertext, authTag = aesCipher.encrypt_and_digest(msg)    
  return (ciphertext, aesCipher.nonce, authTag)
  
def encryptWallet(pin,context):
    pin = 592
    phone = '31627257049'

    binary_passcode = binascii.hexlify(bytes(member['passcode'][:16], 'ascii'))
    secretkey = pin * int(phone[1:])
    # use the passcode to encrypt the wallets' SK
    SK_encryptedMsg = encrypt_AES_GCM(bytes(SK,'ascii'), binary_passcode)
    # use the secret key and passcode to generate the K ciphertext, salt and mac 
    binary_secretkey = binascii.hexlify(bytes(str(secretkey)[:12], 'ascii'))
    K_encryptedMsg = encrypt_AES_GCM(bytes(member['passcode'][:16],'ascii'), binary_secretkey)
    print(SK_encryptedMsg)
    print(K_encryptedMsg)

if __name__ == "__main__":
   encryptWallet(e,'')
