qwallet_dilithium_generation
// CONFIG_REG (Dilithium2 / ML-DSA Parameters)
$K$            = 4         // Matrix rows
$L$            = 4         // Matrix columns
$ETA$          = 2         // Range for "short" secret coefficients
$TAU$          = 39        // Number of +/- 1s in challenge polynomial

// ENTRY_POINT: INITIALIZE_LATTICE_IDENTITY
// -------------------------------------------------------------------------

// PHASE 01: ENTROPY_EXPANSION
// Generate the master seed that will spawn the entire identity
Z_SEED = SYS_ENTROPY(32_BYTES)

// Expand the master seed into internal seeds:
// rho (for Matrix A), rho_prime (for secret vectors), and K (for signing)
{RHO, RHO_PRIME, K_SEED} = SHAKE256_EXPAND(Z_SEED, 3_FRAGMENTS)

// PHASE 02: MATRIX_GENERATION (A)
// Matrix A is a K x L grid of polynomials. 
// It is public and generated deterministically from RHO.
INIT MATRIX_A[K][L]
FOR i FROM 0 TO (K - 1):
    FOR j FROM 0 TO (L - 1):
        MATRIX_A[i][j] = SHAKE128_POLY_GEN(RHO, nonce=(i,j))
    ENDFOR
ENDFOR

// PHASE 03: SECRET_VECTOR_GENERATION (s1, s2)
// These are the "Short Vectors" (the actual Private Key)
INIT S1_VEC[L]
INIT S2_VEC[K]

// S1: Secret coefficients sampled within range [-ETA, ETA]
FOR i FROM 0 TO (L - 1):
    S1_VEC[i] = SAMPLE_SHORT_POLY(RHO_PRIME, nonce=i)
ENDFOR

// S2: Error coefficients sampled within range [-ETA, ETA]
FOR i FROM 0 TO (K - 1):
    S2_VEC[i] = SAMPLE_SHORT_POLY(RHO_PRIME, nonce=(i + L))
ENDFOR

// PHASE 04: PUBLIC_KEY_COMPUTATION (t)
// Compute t = A * s1 + s2
// This is the core lattice problem: T is the "flung" point.
VECTOR_T = (MATRIX_A * S1_VEC) + S2_VEC

// PHASE 05: SERIALIZATION & EXPORT
// Unlike WOTS, Dilithium keys are packed to save space.
FINAL_PK = PACK_PK(RHO, VECTOR_T)
FINAL_SK = PACK_SK(RHO, K_SEED, VECTOR_T, S1_VEC, S2_VEC)

RETURN {
    SECRET_KEY: B58_ENCODE(FINAL_SK),
    PUBLIC_KEY: B58_ENCODE(FINAL_PK)
}
