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
import FormHelperText from '@mui/material/FormHelperText';






function Review() {

    // const [selectedPeriod, setSelectedPeriod] = useState('Today');
    const [modalOpen, setModalOpen] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [displayedReviewItems, setDisplayedReviewItems] = useState([]);
    const [statusFilter, setStatusFilter] = useState('Scheduled');
    // const [periodFilter, setPeriodFilter] = useState('Today');
    const [selectedPattern, setSelectedPattern] = useState(false);



    const handleModalOpen = () => {
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        reset();  // Reset form state upon modal close
    };

    //get all scheduled study items by status(to do)
    useEffect(() => {
        const getDisplayerStudyItems = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/study/status/${statusFilter}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include' // Ensures the request includes the cookie
                });

                if (response.ok) {
                    const result = await response.json();
                    // Sort the data based on 'scheduled_date' or 'finished_date' field
                    result.sort((a, b) => {
                        if (statusFilter === 'Scheduled') {
                            let dateA = new Date(a.scheduled_date), dateB = new Date(b.scheduled_date);
                            return dateA - dateB; // Ascending order for 'Scheduled'
                        } else { // For 'Finished' and 'Canceled'
                            let dateA = new Date(a.finished_date), dateB = new Date(b.finished_date);
                            return dateB - dateA; // Descending order for 'Finished' and 'Canceled'
                        }
                    });
                    setDisplayedReviewItems(result);
                } else {
                    throw new Error('Failed to fetch study items');
                }
            } catch (err) {
                console.error(err.message);
            }
        };

        getDisplayerStudyItems();
    }, [statusFilter]);





    //create a study item
    const onSubmit = async data => {
        console.log(data);
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/review`, {
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
                if (statusFilter === 'Scheduled') {
                    setDisplayedReviewItems(prevStudyItems => [...prevStudyItems, result]);
                }
                setSnackbarMessage('Review item created successfully');
                setSnackbarSeverity('success');
            } else {
                const error = await response.text();
                throw new Error(error);
            }
        } catch (err) {
            console.error(err.message);
            setSnackbarMessage('Error creating review item');
            setSnackbarSeverity('error');
        }

        setSnackbarOpen(true);
        reset();
        handleModalClose();
    };

    return (
        <Container>
            <Paper elevation={3} style={{ minHeight: '100vh', marginTop: '0px', marginBottom: '0px' }} >
                <Box display="flex" flexDirection="column" alignItems="center">
                    <Typography variant="h4" component="div" gutterBottom align="center">
                        Review Overview
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
                    {/* {statusFilter === 'Scheduled' && (
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
                    )} */}
                    <Grid container spacing={3}>
                        {displayedReviewItems.map((studyItem, index) => (
                            <StudyTask
                                key={index}
                                studyItem={studyItem}
                                studyItems={displayedReviewItems}
                                setStudyItems={setDisplayedReviewItems}
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

{/* // Add a Review item Dialog */}
            <Dialog open={modalOpen} onClose={handleModalClose}>
                <DialogTitle style={{ textAlign: 'center', paddingBottom: '0px' }}>Add Review Item</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        <TextField
                            margin="normal"
                            label="Title"
                            type="text"
                            fullWidth
                            style={{ marginTop: 0 }}
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
                            <FormHelperText sx={{color:'#d32f2f'}}>{errors.category?.message}</FormHelperText>
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
                         <FormControl fullWidth margin="dense">
                <InputLabel id="review-pattern-label">Review Pattern</InputLabel>
                <Select
                    labelId="review-pattern-label"
                    {...register('review_pattern', { required: "Review Pattern is required" })}
                    error={!!errors.review_pattern}
                    label="Review Pattern"
                    onChange={(e) => setSelectedPattern(e.target.value)}
                >
                    <MenuItem value="Simple">Default - Simple (1st, 3rd, 7th days)</MenuItem>
                    <MenuItem value="Normal">Default - Normal (1st, 2nd, 4th, 7th, 14th days)</MenuItem>
                    <MenuItem value="Custom">Custom</MenuItem>
                </Select>
                {errors.review_pattern && <p>{errors.review_pattern.message}</p>}
            </FormControl>
            {selectedPattern === 'Custom' && (
                            <TextField
                                margin="dense"
                                label="First Review Date"
                                type="date"
                                fullWidth
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                {...register('firstReviewDate', {
                                    required: "First Review Date is required",
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
                                error={!!errors.firstReviewDate}
                                helperText={errors.firstReviewDate?.message}
                            />
                        )}
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

export default Review;