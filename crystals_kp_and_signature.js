/**
 * @module dilithiumkeypairgeneration
 * @description Generates a post-quantum cryptographic key pair using the
 * CRYSTALS-Dilithium5 signature scheme — a NIST-standardized,
 * lattice-based algorithm designed to be secure against quantum attacks.
 * Signs A message via the dilithium secretkey as well
 * @requires @theqrl/dilithium5
 */


/**
SECURITY NOTES:
 *  The secret key (sk) must be stored securely and never exposed.
 *  Each call produces a unique, non-deterministic key pair.
 *  Do NOT reuse key pairs across different security contexts.
 *  Dilithium5 provides NIST Level 5 security (highest tier).
*/
import { cryptoSignKeypair,CryptoPublicKeyBytes,CryptoSecretKeyBytes,CryptoSign } from '@theqrl/dilithium5';


export function GenerateCDPair() {


    const pk = new Uint8Array(CryptoPublicKeyBytes);  
    const sk = new Uint8Array(CryptoSecretKeyBytes);
    cryptoSignKeypair(null,pk, sk); 

    return {
        pk:pk,
        sk:sk
    }

}




export function SignviaCD(msg,sk) {

    const message = new TextEncoder().encode(msg);
    const signedMessage = cryptoSign(message, sk, false);
    return signedMessage

}
