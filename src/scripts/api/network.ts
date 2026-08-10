const SERVER_URL = import.meta.env.VITE_API_URL
const API_VERSION = 2

export const API_URL = `${SERVER_URL}/v${API_VERSION}`
export const V1_API_URL = `${SERVER_URL}/v1`

class HttpError extends Error {
    constructor(
        public code: string,
        message: string,
        public details?: any
    ) {
        super(message)
        this.name = "HttpError"
    }
}

async function FetchJson(url: string, method: string = "GET", body?: any): Promise<any> {
    if (!url.startsWith("/")) {
        url = `/${url}`
    }

    const response = await fetch(`${API_URL}${url}`, {
        method,
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(body),
    })

    if (response.status == 204) {
        return
    }

    const json = await response.json()

    if (response.ok) {
        return json
    }

    if ("error" in json) {
        throw new HttpError(
            json.error.code,
            json.error.message,
            json.error.details
        )
    }
    throw new HttpError(
        "UNKNOWN_ERROR",
        "An Unknown error occured",
        json
    )
}

export function Get(url: string) {
    return FetchJson(url)
}

export function Post(url: string, data: any) {
    return FetchJson(url, "POST", data)
}
export function Delete(url: string) {
    return FetchJson(url, "DELETE")
}

export function Put(url: string, data: any) {
    return FetchJson(url, "PUT", data)
}
export function Patch(url: string, data: any) {
    return FetchJson(url, "PATCH", data)
}