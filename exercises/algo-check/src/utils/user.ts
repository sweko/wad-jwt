export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: "admin" | "user";
    secret: string;
}

export interface Login {
    username: string;
    password: string;
}

export type LoginResult = Login & { id: number }

export interface FailedVerification {
    status: "failed";
}

export interface SuccessfulVerification<T> {
    status: "success";
    payload: T;
}

export type VerificationResult<T> = FailedVerification | SuccessfulVerification<T>;