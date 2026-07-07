import { Login, LoginResult, User } from "./user";
import { PasswordService } from "./password";

export const users : User[] = [
    {
        id: 1,
        email: 'admin.adminson@example.com',
        firstName: 'Admin',
        lastName: 'Adminson',
        role: 'admin',
        secret: PasswordService.generateSecret()
    },
    {
        id: 2,
        email: 'user.userson@example.com',
        firstName: 'User',
        lastName: 'Userson',
        role: 'user',
        secret: "user-secret"
    }
];

const authDetails: LoginResult[] = [
    {
        username: 'admin',
        password: PasswordService.generateStrongPassword(),
        id: 1
    },
    {
        username: 'user',
        password: 'password',
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
