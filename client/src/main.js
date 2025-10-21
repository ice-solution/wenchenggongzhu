import './style.css'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import theme from './theme.js'
import { App } from './App.js'

// 初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});