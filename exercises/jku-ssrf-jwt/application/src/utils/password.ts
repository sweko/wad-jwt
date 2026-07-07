import { randomBytes } from "crypto";

export interface PasswordPolicy {
    minLength: number;
    lowercaseRequired: boolean;
    uppercaseRequired: boolean;
    numberRequired: boolean;
    symbolRequired: boolean;
}

const defaultPolicy: PasswordPolicy = {
    minLength: 16,
    lowercaseRequired: true,
    uppercaseRequired: true,
    numberRequired: true,
    symbolRequired: true
}

export const PasswordService = {
    generateStrongPassword(policy: PasswordPolicy = defaultPolicy): string {
        // some of the characters in the alphabet may have a slightly lower probability of being picked
        const lcaseAlphabet = "abcdefghijklmnopqrstuvwxyz";
        const ucaseAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numberAlphabet = "0123456789";
        const symbolAlphabet = "^$*.[]{}()?\"!@#%&/\\,><':;|_~`";

        // ensure that the password is at least 16 characters long
        const length = Math.max(policy.minLength, 16);

        const poolSize = 100 + length;

        let pool = randomBytes(poolSize).toJSON().data;

        // forty lower case characters
        const lcase = pool.slice(0, 40).map(n => lcaseAlphabet[n % lcaseAlphabet.length]);
        // thirty upper case characters
        const ucase = pool.slice(40, 70).map(n => ucaseAlphabet[n % ucaseAlphabet.length]);
        // twenty numbers
        const nums = pool.slice(70, 90).map(n => numberAlphabet[n % numberAlphabet.length]);
        // ten symbols
        const sybs = pool.slice(90, 100).map(n => symbolAlphabet[n % symbolAlphabet.length]);

        const password: string[] = [];

        if (policy.lowercaseRequired) {
            password.push(lcase[0]);
            lcase.shift();
        }
        if (policy.uppercaseRequired) {
            password.push(ucase[0]);
            ucase.shift();
        }
        if (policy.numberRequired) {
            password.push(nums[0]);
            nums.shift();
        }
        if (policy.symbolRequired) {
            password.push(sybs[0]);
            sybs.shift();
        }

        const chars = [...lcase, ...ucase, ...nums, ...sybs];
        pool = pool.slice(100);
        while (password.length < length) {
            const charIndex = pool.shift()! % chars.length;
            password.push(chars[charIndex]);
            chars.splice(charIndex, 1);
        }

        return PasswordService.schwartzianShuffle(password).join("");
    },

    generateSecret(): string {
        return PasswordService.generateStrongPassword({
            minLength: 20,
            lowercaseRequired: true,
            uppercaseRequired: false,
            numberRequired: false,
            symbolRequired: false
        });
    },

    schwartzianShuffle<T>(array: T[]): T[] {
        const poolSize = array.length;
        const pool = randomBytes(poolSize).toJSON().data;
        return array
            .map((value, index) => ({ value, sort: pool[index] }))
            .sort((a, b) => a.sort - b.sort)
            .map(x => x.value);
    }
}
