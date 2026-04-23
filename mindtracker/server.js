import { app } from './App.js'

const PORT = process.env.PORT ?? 2345
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})
