type Json =
    | string
    | number
    | boolean
    | null
    | Json[]
    | { [key: string]: Json }
type id = string