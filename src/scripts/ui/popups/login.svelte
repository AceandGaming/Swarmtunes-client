<script module lang="ts">
    function GetFeildOfErrorCode(code: string): "username" | "password" | "all" | "none" | undefined {
        switch (code) {
            case "USERNAME_TOO_SHORT":
                return "username"
            case "USERNAME_TOO_LONG":
                return "username"
            case "INVALID_USERNAME":
                return "username"
            case "PASSWORD_TOO_LONG":
                return "password"
            case "PASSWORD_TOO_SHORT":
                return "password"
            case "PASSWORD_TOO_WEAK":
                return "password"
            case "INVALID_USERNAME_OR_PASSWORD":
                return "all"
            case "ACCOUNT_LIMIT_REACHED":
                return "none"
            case "USER_ALREADY_EXISTS":
                return "username"
        }
        return undefined
    }
</script>

<script lang="ts">
    import Popup from "@ts/ui/popups/popup.svelte"
    import { Login, Signup } from "@ts/login.svelte.ts"
    import { HttpError } from "@ts/api/network"

    let usernameError = $state(false)
    let passwordError = $state(false)
    let errorMessage = $state("")

    let visible = $state(true)
    let busy = $state(false)

    let username = $state("")
    let password = $state("")

    let passwordInput: HTMLInputElement

    async function Submit(func: typeof Login | typeof Signup) {
        try {
            busy = true
            const user = await func(username, password)
            visible = false
        }
        catch (e) {
            console.error(e)
            if (e instanceof HttpError) {
                const error = GetFeildOfErrorCode(e.code)
                if (error) {
                    errorMessage = e.message
                    switch (error) {
                        case "username":
                            usernameError = true
                            break
                        case "password":
                            passwordError = true
                            break
                        case "all":
                            usernameError = true
                            passwordError = true
                            break
                    }
                    return
                }
            }
            errorMessage = "An unknown error occurred"
        }
        finally {
            busy = false
        }
    }

    $effect(() => {
        if (password.length > 256) {
            errorMessage = "Password too long"
            passwordError = true
        }
        else if (password.length < 8) {
            errorMessage = "Password too short"
            passwordError = true
        }
        else {
            passwordError = false
        }

        if (username.length > 32) {
            errorMessage = "Username too long"
            usernameError = true
        }
        else if (username.length < 3) {
            errorMessage = "Username too short"
            usernameError = true
        }
        else if (!(/^[a-z0-9_]+$/.test(username))) {
            errorMessage = "Invalid username"
            usernameError = true
        }
        else {
            usernameError = false
        }
    })

</script>

<Popup title="Login" bind:visible bind:busy>
    <input 
        class:error={usernameError} 
        
        autocomplete="username" 
        type="text" 
        placeholder="Username" 
        
        bind:value={username} 
        onkeydown={(e) => e.key === "Enter" && passwordInput.focus()}
    >
    <input 
        class:error={passwordError} 
        
        autocomplete="current-password" 
        type="password" 
        placeholder="Password" 
        
        bind:value={password} onkeydown={(e) => e.key === "Enter" && Submit(Login)}
        bind:this={passwordInput}
    >
    {#if passwordError || usernameError}
        <p class="error">{errorMessage}</p>
    {/if}
    {#snippet buttons()}
        <button onclick={() => Submit(Signup)}>Signup</button>
        <button onclick={() => Submit(Login)}>Login</button>
    {/snippet}
</Popup>

<style>
    p.error {
        color: red;
        font-size: 0.8rem;
    }
    input.error {
        border-color: red;
    }
</style>