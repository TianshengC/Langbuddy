import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

export const ColorButton = styled(Button)(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    textTransform: 'none',
    backgroundColor: theme.palette.primary.light,
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
}));

export const OutlineButton = styled(Button)(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    textTransform: 'none',
    borderColor: theme.palette.primary.contrastText,
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
}));

export const TextButton = styled(Button)(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    textTransform: 'none',
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
}));

// const BootstrapButton = styled(Button)({
//   boxShadow: 'none',
//   textTransform: 'none',
//   fontSize: 16,
//   padding: '6px 12px',
//   border: '1px solid',
//   lineHeight: 1.5,
//   backgroundColor: '#0063cc',
//   borderColor: '#0063cc',
//   fontFamily: [
//     '-apple-system',
//     'BlinkMacSystemFont',
//     '"Segoe UI"',
//     'Roboto',
//     '"Helvetica Neue"',
//     'Arial',
//     'sans-serif',
//     '"Apple Color Emoji"',
//     '"Segoe UI Emoji"',
//     '"Segoe UI Symbol"',
//   ].join(','),
//   '&:hover': {
//     backgroundColor: '#0069d9',
//     borderColor: '#0062cc',
//     boxShadow: 'none',
//   },
//   '&:active': {
//     boxShadow: 'none',
//     backgroundColor: '#0062cc',
//     borderColor: '#005cbf',
//   },
//   '&:focus': {
//     boxShadow: '0 0 0 0.2rem rgba(0,123,255,.5)',
//   },
// });

// const ColorButton = styled(Button)(({ theme }) => ({
//   color: theme.palette.getContrastText(purple[500]),
//   textTransform: 'none',
//   backgroundColor: purple[500],
//   '&:hover': {
//     backgroundColor: purple[700],
//   },
// }));






