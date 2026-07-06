import { Login, LoginResult, User } from "./user";

export const users : User[] = [
    {
        id: 1,
        email: 'user.userson@example.com',
        firstName: 'User',
        lastName: 'Userson',
        role: 'user',
        secret: "user-secret"
    },
    {
        id: 2,
        email: 'admin.adminson@example.com',
        firstName: 'Admin',
        lastName: 'Adminson',
        role: 'admin',
        secret: "admin-secret"
    }
];

const authDetails: LoginResult[] = [
    {
        username: 'user',
        password: 'password',
        id: 1
    },
    {
        username: 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin',
        id: 2
    }
];

export const authenticate = ({ username, password }: Login): User | undefined => {
    const user = authDetails.find((user) => user.username === username && user.password === password);
    if (!user) {
        return undefined;
    }
    return users.find((u) => u.id === user.id);
};