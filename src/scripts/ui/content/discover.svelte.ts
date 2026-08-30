import { GetDiscoverPage } from "@ts/api/pages"

let content: Awaited<ReturnType<typeof GetDiscoverPage>> | undefined

export async function GetDiscover() {
    if (!content) {
        content = await GetDiscoverPage()
    }
    return content
}