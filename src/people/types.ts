export type Address = {
  street: string
  city: string
  zip: string
}

export type Person = {
  id: string
  firstName: string
  lastName: string
  age: number
  email: string
  address: Address
  tags: string[]
}
