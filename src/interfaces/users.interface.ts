export interface UsersInterface {
    users: User[];
}

export interface User {
    id: number;
    name: string;
    username: string;
    role: TypeRole;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RolesInterface {
    roles: Role[];
}

export interface Role {
    name: string;
    role: TypeRole;
}

export type TypeRole = "ADMIN" | "CAJERO" | "SUPERVISOR";


//Body
export interface UserBody {
    name: string;
    username: string;
    password: string;
    role: string;
    email: string;
}