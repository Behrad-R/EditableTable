import type { Person } from './types'

export const people: Person[] = [
  {
    id: '1',
    firstName: 'Anna',
    lastName: 'Schmidt',
    age: 29,
    email: 'anna@example.com',
    address: { street: 'Hauptstraße 1', city: 'Berlin', zip: '10115' },
    tags: ['admin'],
  },
  {
    id: '2',
    firstName: 'Lukas',
    lastName: 'Weber',
    age: 34,
    email: 'lukas@example.com',
    address: { street: 'Bahnhofstraße 12', city: 'Hamburg', zip: '20095' },
    tags: ['sales', 'remote'],
  },
  {
    id: '3',
    firstName: 'Mia',
    lastName: 'Fischer',
    age: 41,
    email: 'mia@example.com',
    address: { street: 'Gartenweg 5', city: 'München', zip: '80331' },
    tags: [],
  },
  {
    id: '4',
    firstName: 'Jonas',
    lastName: 'Becker',
    age: 23,
    email: 'jonas@example.com',
    address: { street: 'Schulstraße 8', city: 'Köln', zip: '50667' },
    tags: ['intern'],
  },
]
