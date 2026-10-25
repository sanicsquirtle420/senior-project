export interface User {
    id: string;
    username: string ;
    name: string ;
}

export interface LoginResponse extends User {
    token: string ;
}

export interface SignupResponse extends User {
    password: string ;
}

export interface Friend {
    userID: number;
    name: string;
    username: string;
    friendshipID: number;
}