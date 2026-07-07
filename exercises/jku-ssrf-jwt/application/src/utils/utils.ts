import { Request, Response } from 'express';

export const omit = <T, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> => {
    const copy = { ...obj };
    keys.forEach((key) => delete copy[key]);
    return copy;
};

export const setJwtCookie = (req: Request, res: Response, token: string): void => {
    const secure = req.secure ? '; Secure' : '';
    res.header('Set-Cookie', `jwt=${token}; HttpOnly; SameSite=Strict${secure}`);
};
