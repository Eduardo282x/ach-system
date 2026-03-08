
export interface LoginForm {
    username: string;
    password: string;
}

export interface LoginData {
    user:  User;
    token: string;
}

export interface User {
    id:        number;
    name:      string;
    username:  string;
    role:      string;
    email:     string;
    createdAt: Date;
    updatedAt: Date;
}


export interface Cashier {
    id:        number;
    name:      string;
    cashDrawer: string;
}