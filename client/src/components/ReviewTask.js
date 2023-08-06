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
import getReviewStatus from '../utils/getReviewStatus';




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

    const reviewStatus = getReviewStatus(reviewSessions);

    const formattedCreateDate = new Date(created_date).toLocaleDateString();

    const [dialogOpen, setDialogOpen] = useState(false);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const { register, handleSubmit, formState: { errors }, setValue, control } = useForm();
    const [addSessionDialogOpen, setAddSessionDialogOpen] = useState(false);
    const [newSessionDate, setNewSessionDate] = useState(null);
    const [elevation, setElevation] = useState(3);

    let fullSessions = false;
    if (reviewStatus === "Scheduled" && reviewSessions.length === 5) {
        fullSessions = true;
    }

    const handleDialogOpen = () => {
        setDialogOpen(true);
    };

    const handleEditDialogOpen = () => {
        setValue('title', reviewItem.title);
        setValue('category', reviewItem.category);
        setValue('content', reviewItem.content);
        setEditDialogOpen(true);
    };

    // Display only the first 200 characters of the content
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

        // Loop through the data object and extract the id_session and scheduled_date
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
                console.log('Updated review item:');
                console.log(updatedReviewItem);
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

    const handleAddSession = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/review/add-session/${reviewItem.id_review}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Ensures the request includes the cookie
                body: JSON.stringify({ scheduled_date: newSessionDate })
            });

            if (response.ok) {
                const addedSession = await response.json();
                console.log('added review item:');
                console.log(addedSession);
                const index = displayedReviewItems.findIndex(item => item.id_review === addedSession.id_review);
                if (index !== -1) {
                    const newReviewItems = [...displayedReviewItems];
                    newReviewItems[index].reviewSessions.push(addedSession);
                    console.log(newReviewItems);
                    setDisplayedReviewItems(newReviewItems);
                }

                setSnackbarMessage('Review session added successfully');
                setSnackbarSeverity('success');
            } else {
                const error = await response.text();
                throw new Error(error);
            }

        } catch (err) {
            console.error(err.message);
            setSnackbarMessage(err.message || 'Error adding review session');
            setSnackbarSeverity('error');
        } finally {
            setAddSessionDialogOpen(false);
            setSnackbarOpen(true);
        }
    };


    //handle mouse over on the card
    const handleMouseEnter = () => {
        setElevation(10);
    };

    const handleMouseLeave = () => {
        setElevation(3);
    };

    return (
        <Box>
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
                            {content.length > 200 && <Button onClick={handleDialogOpen}>Read More</Button>}
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
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center">
                        {(reviewStatus === "Scheduled" && fullSessions) && <Typography variant="body2" color="text.secondary" marginTop={2} style={{ fontStyle: 'italic' }}> *Maximun 5 sessions </Typography>}
                        </Box>
                        <Box display="flex" justifyContent="flex-end" marginTop={1} flexGrow={1}>
                            {(reviewStatus === "Scheduled" && !fullSessions) && <Button size="small" variant="outlined" color="warning" onClick={() => setAddSessionDialogOpen(true)} style={{ width: '69px' }}>Add</Button>}
                            {reviewStatus === "Scheduled" && <Button size="small" variant="outlined" color="primary" onClick={handleEditDialogOpen} style={{ width: '66px' }}>Edit</Button>}
                            {reviewStatus !== "Scheduled" && <Chip label="ARCHIEVED" style={{ backgroundColor: '#eeeeee' }} />}
                        </Box>
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
                                    <Typography variant="body2" color="text.secondary" key={index}>
                                        Session {index + 1} {session.status.toLowerCase()} date: {formatDate(session.finished_date)}
                                    </Typography>

                                );
                            } else {

                                // Format the scheduled date to be compatible with the date input
                                const scheduledDate = new Date(session.scheduled_date);
                                const formattedScheduledDate = `${scheduledDate.getFullYear()}-${('0' + (scheduledDate.getMonth() + 1)).slice(-2)}-${('0' + scheduledDate.getDate()).slice(-2)}`;

                                return (
                                    <Controller
                                        key={session.id_session}
                                        name={`session_${session.id_session}`}
                                        control={control}
                                        defaultValue={formattedScheduledDate}
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
                        <Button type="submit">Edit</Button>
                        <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* dialog for add review session*/}
            <Dialog open={addSessionDialogOpen} onClose={() => setAddSessionDialogOpen(false)}>
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
                    <Typography variant="subtitle1" color="text.secondary">
                        Current Session Dates:
                        {
                            reviewItem.reviewSessions.map((session, index) => (
                                <div key={index}> Session {index + 1} {session.status}: {formatDate(session.scheduled_date)}</div>
                            ))
                        }
                    </Typography>
                    <TextField
                        required
                        margin="dense"
                        id="date"
                        label="New Session Date"
                        type="date"
                        onChange={(event) => setNewSessionDate(event.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        InputProps={{
                            inputProps: {
                                min: new Date().toISOString().split('T')[0]
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddSession}>Add</Button>
                    <Button onClick={() => setAddSessionDialogOpen(false)}>Cancel</Button> 
                </DialogActions>
            </Dialog>


            </Box>
    );
}

export default ReviewTask;