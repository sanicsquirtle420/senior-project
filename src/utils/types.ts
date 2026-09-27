export interface User {
    id: string;
    username: string ;
    name: string ;
}

export interface LoginResponse extends User {
    token: string ;
}