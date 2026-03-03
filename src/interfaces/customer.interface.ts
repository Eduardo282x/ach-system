export interface CustomerContent {
    clients: Client[];
}

export interface Client {
    id:       number;
    identify: string;
    phone:    string;
    fullName: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ClientBody extends Omit<Client, 'id'> {}