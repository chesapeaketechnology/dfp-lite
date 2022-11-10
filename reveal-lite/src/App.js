import React from "react";
import './App.css';
import Map from './components/Map';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

function App() {

  const darkTheme = createTheme({
    palette: {
        mode: "dark"
    }
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline enableColorScheme />
      <Map />
    </ThemeProvider>
  );
}

export default App;
