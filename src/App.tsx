import { Container, CssBaseline, Typography } from '@mui/material'
import { EditableTable } from './editable-table'
import { personColumns } from './people/columns'
import { people } from './people/data'
import type { Person } from './people/types'

const getPersonId = (person: Person) => person.id

function App() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Editable table
        </Typography>
        <EditableTable
          columns={personColumns}
          initialData={people}
          getRowId={getPersonId}
        />
      </Container>
    </>
  )
}

export default App
