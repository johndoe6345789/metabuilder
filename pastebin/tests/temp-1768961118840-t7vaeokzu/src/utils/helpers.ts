
export const add = (a: number, b: number): number => a + b;
export const multiply = (a: number, b: number): number => a * b;
export const isEmpty = (str: string): boolean => str.length === 0;

interface User {
  id: string;
  name: string;
  email: string;
}

export const getUserName = (user: User): string => user.name;
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
        