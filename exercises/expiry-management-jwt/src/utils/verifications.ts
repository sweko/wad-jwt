interface FailedVerification<T> {
    status: "failed";
    reason: "expired" | "invalid" | "missing";
    payload?: T;
}

interface SuccessfulVerification<T> {
    status: "success";
    payload: T;
}

export type VerificationResult<T> = FailedVerification<T> | SuccessfulVerification<T>;