import { Login as NetLogin, Signup as NetSignup, GetMe as NetGetMe, Logout as NetLogout } from "@ts/api/auth"
import type { User } from "@ts/api/auth"

let user: User | undefined = $state()
let initialized = $state(false)

export const auth = {
    get user() {
        return user
    },
    get loggedIn() {
        return user !== undefined
    },
    get admin() {
        return user?.role === "admin"
    },
    get initialized() {
        return initialized
    }
}

export async function Login(username: string, password: string) {
    user = await NetLogin(username, password)

    Trigger()
    return user
}
export async function Signup(username: string, password: string) {
    user = await NetSignup(username, password)

    Trigger()
    return user
}
export async function Logout() {
    await NetLogout()
    user = undefined

    Trigger()
}

export async function Initialize() {
    if (initialized) {
        console.warn("Already initialized")
        return
    }

    try {
        user = await NetGetMe()
    }
    catch {
        user = undefined
    }

    initialized = true

    Trigger()
}

const callbacks: ((user: User | undefined) => void)[] = []

/** @deprecated Use Svelte **/
export function OnLogin(callback: (user: User | undefined) => void) {
    callbacks.push(callback)
}

function Trigger() {
    callbacks.forEach(callback => callback(user))
}