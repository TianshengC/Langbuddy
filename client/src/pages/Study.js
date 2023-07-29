import { Container } from "@mui/material";
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { useEffect, useState } from "react";
import Paper from '@mui/material/Paper';
import StudyTask from "../components/StudyTask";
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { useForm } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import categories from '../utils/categories';





function Study() {

    const [selectedPeriod, setSelectedPeriod] = useState('Today');
    const [modalOpen, setModalOpen] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [studyItems, setStudyItems] = useState([]);
    const [statusFilter, setStatusFilter] = useState('Scheduled');
    const [periodFilter, setPeriodFilter] = useState('Today');


    const handlePeriodChange = (period) => {
        setSelectedPeriod(period);
    };

    const handleModalOpen = () => {
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        reset();  // Reset form state upon modal close
    };

    useEffect(() => {
        const getStudyItems = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/study`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include' // Ensures the request includes the cookie
                });

                if (response.ok) {
                    const result = await response.json();
                    setStudyItems(result);
                } else {
                    throw new Error('Failed to fetch study items');
                }
            } catch (err) {
                console.error(err.message);
            }
        };

        getStudyItems();
    }, []);




    const onSubmit = async data => {

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/study`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Ensures the request includes the cookie
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                console.log(result);
                setStudyItems(prevStudyItems => [...prevStudyItems, result]);
                setSnackbarMessage('Study item created successfully');
                setSnackbarSeverity('success');
            } else {
                const error = await response.text();
                throw new Error(error);
            }
        } catch (err) {
            console.error(err.message);
            setSnackbarMessage('Error creating study item');
            setSnackbarSeverity('error');
        }

        setSnackbarOpen(true);
        reset();
        handleModalClose();
    };

    return (
        <Container>
            <Paper elevation={3}>
                <Box display="flex" flexDirection="column" alignItems="center">
                    <Typography variant="h4" component="div" gutterBottom align="center">
                        Study Overview
                    </Typography>
                    <ButtonGroup variant="contained" aria-label="outlined primary button group" sx={{ mt: 0.5 }}>
            <Button
                onClick={() => setStatusFilter('Scheduled')}
                variant={statusFilter === 'Scheduled' ? 'contained' : 'outlined'}
                color={statusFilter === 'Scheduled' ? 'primary' : 'default'}
            >
                Scheduled
            </Button>
            <Button
                onClick={() => setStatusFilter('Finished')}
                variant={statusFilter === 'Finished' ? 'contained' : 'outlined'}
                color={statusFilter === 'Finished' ? 'primary' : 'default'}
            >
                Finished
            </Button>
            <Button
                onClick={() => setStatusFilter('Canceled')}
                variant={statusFilter === 'Canceled' ? 'contained' : 'outlined'}
                color={statusFilter === 'Canceled' ? 'primary' : 'default'}
            >
                Canceled
            </Button>
        </ButtonGroup>
        {statusFilter === 'Scheduled' && (
            <ButtonGroup variant="contained" aria-label="outlined primary button group" sx={{ mt: 0.5 }}>
                <Button
                    onClick={() => setPeriodFilter('Today')}
                    variant={periodFilter === 'Today' ? 'contained' : 'outlined'}
                    color={periodFilter === 'Today' ? 'primary' : 'default'}
                >
                    Today
                </Button>
                <Button
                    onClick={() => setPeriodFilter('7 days')}
                    variant={periodFilter === '7 days' ? 'contained' : 'outlined'}
                    color={periodFilter === '7 days' ? 'primary' : 'default'}
                >
                    Next 7 days
                </Button>
                <Button
                    onClick={() => setPeriodFilter('All')}
                    variant={periodFilter === 'All' ? 'contained' : 'outlined'}
                    color={periodFilter === 'All' ? 'primary' : 'default'}
                >
                    All
                </Button>
            </ButtonGroup>
        )}
                    <Grid container spacing={3}>
                        {studyItems.map((studyItem, index) => (
                            <StudyTask
                                key={index}
                                studyItem={studyItem}
                                studyItems={studyItems}
                                setStudyItems={setStudyItems}
                                snackbarOpen={snackbarOpen}
                                setSnackbarOpen={setSnackbarOpen}
                                snackbarMessage={snackbarMessage}
                                setSnackbarMessage={setSnackbarMessage}
                                snackbarSeverity={snackbarSeverity}
                                setSnackbarSeverity={setSnackbarSeverity}
                            />
                        ))}
                    </Grid>
                    <Tooltip title="Add Study Item" placement="top" arrow>
                        <Fab color="primary" aria-label="add" style={{ position: "fixed", bottom: "40px", right: "30px" }} onClick={handleModalOpen}>
                            <AddIcon />
                        </Fab>
                    </Tooltip>
                </Box>
            </Paper>

{/* // Add a study item Dialog */}
            <Dialog open={modalOpen} onClose={handleModalClose}>
                <DialogTitle style={{ textAlign: 'center' }}>Add Study Item</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            label="Title"
                            type="text"
                            fullWidth
                            {...register('title', { required: "Title is required" })}
                            error={!!errors.title}
                            helperText={errors.title?.message}
                        />
                        <FormControl fullWidth margin="dense">
                            <InputLabel id="category-label">Category</InputLabel>
                            <Select
                                labelId="category-label"
                                {...register('category', { required: "Category is required" })}
                                error={!!errors.category}
                                label="Category"
                            >
                                {categories.map((category, index) => (
                                    <MenuItem key={index} value={category}>{category}</MenuItem>
                                ))}
                            </Select>
                            {errors.category && <p>{errors.category.message}</p>}
                        </FormControl>
                        <TextField
                            margin="dense"
                            label="Content"
                            type="text"
                            fullWidth
                            multiline
                            minRows={5}
                            maxRows={10}
                            {...register('content', { required: "Content is required", maxLength: 2000 })}
                            error={!!errors.content}
                            helperText={errors.content?.message}
                        />
                        <TextField
                            margin="dense"
                            label="Scheduled Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{
                                shrink: true,
                            }}
                            {...register('scheduled_date', {
                                required: "Scheduled date is required",
                                validate: {
                                    isFuture: value => {
                                        const inputDate = new Date(value);
                                        const todaysDate = new Date();

                                        // resetting the hours, minutes, seconds and milliseconds for comparison
                                        inputDate.setHours(0, 0, 0, 0);
                                        todaysDate.setHours(0, 0, 0, 0);

                                        return inputDate >= todaysDate || 'The date should not be in the past';
                                    }
                                }
                            })}
                            error={!!errors.scheduled_date}
                            helperText={errors.scheduled_date?.message}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleModalClose}>Cancel</Button>
                        <Button type="submit">Submit</Button>
                    </DialogActions>
                </form>
            </Dialog>


{/* // Snackbar to provide hints */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    )
}

export default Study;