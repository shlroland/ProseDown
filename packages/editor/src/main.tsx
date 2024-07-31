import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Editor } from './editor'
import './styles/index.css'
import 'virtual:uno.css'

const element = document.getElementById('root')
if (!element) throw new ReferenceError(`react contained doesn't exist`)

const app = createRoot(element)

app.render(
  <StrictMode>
    <Editor />
  </StrictMode>,
)
