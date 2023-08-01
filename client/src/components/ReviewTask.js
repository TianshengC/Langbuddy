import { Card, CardContent, Typography, Divider, Grid, Chip, Button, Box } from '@mui/material';
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useForm, Controller } from 'react-hook-form';
import formatDate from '../utils/FormatDate';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import categories from '../utils/categories';
import ReviewSessionItem from './ReviewSessionItem';



function ReviewTask({
    reviewItem,
    displayedReviewItems,
    setDisplayedReviewItems,
    snackbarOpen,
    setSnackbarOpen,
    snackbarMessage,
    setSnackbarMessage,
    snackbarSeverity,
    setSnackbarSeverity,
}) {
    const { category, title, content, created_date, reviewSessions } = reviewItem;


    const formattedCreateDate = new Date(created_date).toLocaleDateString();
  
    const [dialogOpen, setDialogOpen] = useState(false);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const { register, handleSubmit, formState: { errors }, setValue, control } = useForm();
    const [elevation, setElevation] = useState(3);

    const handleDialogOpen = () => {
        setDialogOpen(true);
    };

    const handleEditDialogOpen = () => {
        setValue('title', reviewItem.title);
        setValue('category', reviewItem.category);
        setValue('content', reviewItem.content);
        setEditDialogOpen(true);
    };

  
    const displayContent = content.length > 200 ? content.substring(0, 200) + "..." : content;

    //Edit study item submission
    const onEditSubmit = async data => {
        const transformedData = {
            // id_review: reviewItem.id_review,
            title: data.title,
            category: data.category,
            content: data.content,
            reviewSessions: []
        }

        for (let key in data) {

            if (key.startsWith('session_')) {
                transformedData.reviewSessions.push({
                    id_session: parseInt(key.split('_')[1]),  // Get session ID from key
                    scheduled_date: data[key]
                });
            }
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/review/edit/${reviewItem.id_review}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Ensures the request includes the cookie
                body: JSON.stringify(transformedData)
            });

            if (response.ok) {
                const updatedReviewItem = await response.json();
                const index = displayedReviewItems.findIndex(item => item.id_review === updatedReviewItem.id_review);
                if (index !== -1) {
                    const newReviewItems = [...displayedReviewItems];
                    newReviewItems[index] = updatedReviewItem;
                    setDisplayedReviewItems(newReviewItems);
                }

                setSnackbarMessage('Review item updated successfully');
                setSnackbarSeverity('success');
            } else {
                const error = await response.text();
                throw new Error(error);
            }
        } catch (err) {
            console.error(err.message);
            setSnackbarMessage(err.message || 'Error updating review item');
            setSnackbarSeverity('error');
        }

        setEditDialogOpen(false);
        setSnackbarOpen(true);
    };

    //handle mouse over on the card

    const handleMouseEnter = () => {
        setElevation(10);
    };

    const handleMouseLeave = () => {
        setElevation(3);
    };

    return (
        <Grid item xs={12} sm={6} md={4}>
            <Card elevation={elevation} style={{ border: '1px solid #ddd' }} sx={{ mt: 2 }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <CardContent style={{ paddingBottom: 8 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={1}>
                        <Typography variant={title.length > 25 ? "subtitle1" : "h6"} component="div" fontWeight="bold" style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>{title}</Typography>
                        <Chip label={category} size="small" />
                    </Box>
                    <Divider />
                    <Box style={{ height: '175px', overflow: 'auto' }}>
                        <Typography variant="body1" color="text.secondary" marginTop={1} marginBottom={1}>
                            {displayContent}
                            {content.length>200 && <Button onClick={handleDialogOpen}>Read More</Button>}
                        </Typography>
                    </Box>
                    <Divider />
                    {/* Render the review sessions */}
                    <Box display="flex" flexDirection="column" justifyContent="space-between" marginTop={1}>
                        {reviewSessions.map((session, index) =>
                             <ReviewSessionItem 
                        key={index} 
                        session={session} 
                        sessionNumber={index + 1} 
                        setSnackbarMessage={setSnackbarMessage}
                        setSnackbarSeverity={setSnackbarSeverity}
                        setSnackbarOpen={setSnackbarOpen}
                        displayedReviewItems={displayedReviewItems}
                        setDisplayedReviewItems={setDisplayedReviewItems}
                        />)}
                    </Box>

                    {/* Action button */}
                    <Box display="flex" justifyContent="flex-end" marginTop={1}>
                        <Button size="small" variant="outlined" color="primary" onClick={handleEditDialogOpen}>Edit</Button>
                    </Box>
                </CardContent>
            </Card>


            {/* dialog for read more */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={1}>
                        <Typography variant={title.length > 25 ? "subtitle1" : "h6"} component="div" fontWeight="bold" style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>{title}</Typography>
                        <Chip label={category} size="small" />
                    </Box>
                    <Divider />
                    <Box style={{ overflow: 'auto' }}>
                        <Typography variant="body1" color="text.secondary" marginTop={1} marginBottom={1}>
                            {content}
                        </Typography>
                    </Box>
                    <Divider />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* dialog for edit review item*/}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle style={{ textAlign: 'center' }}>Edit Review Item</DialogTitle>
                <form onSubmit={handleSubmit(onEditSubmit)}>
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
                        {reviewItem.reviewSessions.map((session, index) => {
                            if (session.status === "Finished" || session.status === "Canceled") {
                                return (
                                    <Typography variant="body1" key={index}>
                                        Session {index + 1} {session.status.toLowerCase()} date: {session.finished_date}
                                    </Typography>
                                );
                            } else {
                                return (
                                    <Controller
                                        key={session.id_session}
                                        name={`session_${session.id_session}`}
                                        control={control}
                                        defaultValue={formatDate(session.scheduled_date)}
                                        rules={{
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
                                        }}
                                        render={({ field }) =>
                                            <TextField
                                                {...field}
                                                margin="dense"
                                                label={`Session ${index + 1} Scheduled Date`}
                                                type="date"
                                                fullWidth
                                                error={!!errors[`session_${index + 1}`]}
                                                helperText={errors[`session_${index + 1}`]?.message}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        }
                                    />
                                );
                            }
                        })}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                        <Button type="submit">Edit</Button>
                    </DialogActions>
                </form>
            </Dialog>


        </Grid>
    );
}

export default ReviewTask;