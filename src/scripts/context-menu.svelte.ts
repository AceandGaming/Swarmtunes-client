import type { Component } from "svelte"

export const ContextMenuGroup = {
    Default: 0,
    Queue: 10,
    Playlist: 20,
    Edit: 30,
    Share: 40,
    Admin: 100
}

export type ContextMenuOption = {
    label: string
    icon?: Component

    group?: number

    visible?: boolean
    options?: ContextMenuOption[]

    Action?: () => void | Promise<void>
}

class MenuState {
    public visible: boolean = $state(false)
    public options: ContextMenuOption[] = $state([])
    public x = $state(0)
    public y = $state(0)
}
export const state = new MenuState()

export default class ContextMenu {
    public static Show({ options, x, y }: { options: ContextMenuOption[], x: number, y: number }) {
        state.visible = true
        state.options = [...options].sort((a, b) => (a.group ?? 0) - (b.group ?? 0))
        state.x = x
        state.y = y
    }
    public static Hide() {
        state.visible = false
    }
}