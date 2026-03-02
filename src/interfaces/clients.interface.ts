export interface ClientInterface {
    clients: Client[];
}

export interface Client {
    id:       number;
    identify: string;
    phone:    string;
    fullName: string;
}
