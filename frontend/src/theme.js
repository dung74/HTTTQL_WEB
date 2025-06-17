import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Xanh lá cây đậm (sức khỏe)
    },
    secondary: {
      main: '#ffca28', // Vàng nhạt (nhấn mạnh)
    },
    background: {
      default: '#f5f5f5', // Màu nền nhẹ
      paper: '#ffffff', // Màu nền cho card và dialog
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

export default theme;