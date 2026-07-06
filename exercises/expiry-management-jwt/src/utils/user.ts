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

