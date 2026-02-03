type ListItemData = {
    Id?: id
    Title?: string
    Artist?: string
    Singers?: string[]
    CoverUrl?: string
    Date?: Date
}

class ListItem extends HTMLElement {
    public get Id(): id {
        return this.data.Id
    }
    public set Id(value: id) {
        if (this.data.Id) {
            throw new Error("Id already set")
        }
        this.data.Id = value
    }

    data: ListItemData = {}

    constructor() {
        super()
    }
}

class List extends UIObject {

}