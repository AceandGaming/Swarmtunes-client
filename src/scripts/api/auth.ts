import { Post, Get } from "./network"

export type User = {
    id: string,
    username: string,
    role: "user" | "admin"
}

export function Login(username: string, password: string): Promise<User> {
    return Post("/login", { username, password })
}
export function Signup(username: string, password: string): Promise<User> {
    return Post("/signup", { username, password })
}
export function GetMe(): Promise<User> {
    return Get("/me")
}
export function Logout() {
    return Post("/logout", {})
}