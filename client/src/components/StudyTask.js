import { Card, CardContent, Typography, Divider, Grid, Chip, Button, Box } from '@mui/material';
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useForm } from 'react-hook-form';
import formatDate from '../utils/FormatDate';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import categories from '../utils/categories';
import FormHelperText from '@mui/material/FormHelperText';
import isOverdue from '../utils/isOverdue';

function StudyTask({
    studyItem,
    studyItems,
    setStudyItems,
    setSnackbarOpen,
    setSnackbarMessage,
    setSnackbarSeverity,
}) {
    const { category, title, content, created_date, scheduled_date, finished_date, status } = studyItem;

    const formattedCreateDate = formatDate(created_date);
    const formattedScheduledDate = formatDate(scheduled_date);
    const formattedFinishedDate = finished_date ? formatDate(finished_date) : null;
    const [readMoreDialogOpen, setReadMoreDialogOpen] = useState(false);
    const [confirmStatusChangeOpen, setConfirmStatusChangeOpen] = useState(false);
    const [newStatus, setNewStatus] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm();
    const [elevation, setElevation] = useState(3);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedReviewPattern, setSelectedReviewPattern] = useState("");

    const { register: reviewRegister, handleSubmit: reviewHandleSubmit, formState: { errors: reviewErrors }, setValue: reviewSetValue, reset: reviewReset } = useForm();

    //formatted date for edit default date
    const scheduledDate = new Date(scheduled_date);
    const defaultScheduledDate = `${scheduledDate.getFullYear()}-${('0' + (scheduledDate.getMonth() + 1)).slice(-2)}-${('0' + scheduledDate.getDate()).slice(-2)}`;

    //formatted display content and dispalyed date
    const displayContent = content.length > 200 ? content.substring(0, 200) + "..." : content;
    const statusDate = status === "Scheduled" ? formattedScheduledDate : formattedFinishedDate;



    const handleReadMoreDialogOpen = () => {
        setReadMoreDialogOpen(true);
    };

    //Status cancel change
    const handleStatusChange = (status) => {
        setNewStatus(status);
        setConfirmStatusChangeOpen(true);
    };

    const cancelStatusChange = () => {
        setNewStatus(null);
        setConfirmStatusChangeOpen(false);
    };

    //Status change confirmation submission
    const confirmStatusChange = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/study/change-status/${studyItem.id_study}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Ensures the request includes the cookie
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                const updatedStudyItem = await response.json();
                // find the index of the studyItem in the array
                const index = studyItems.findIndex(item => item.id_study === studyItem.id_study);


                if (index !== -1) {
                    const newStudyItems = [...studyItems];
                    newStudyItems[index] = updatedStudyItem;
                    setStudyItems(newStudyItems);
                }

                setSnackbarMessage('Study item updated successfully');
                setSnackbarSeverity('success');
            } else {
                const error = await response.text();
                throw new Error(error);
            }
        } catch (err) {
            console.error(err.message);
            setSnackbarMessage(err.message || 'Error updating study item');
            setSnackbarSeverity('error');
        }

        setConfirmStatusChangeOpen(false);
        setNewStatus(null);
        setSnackbarOpen(true);
    };

    //handle Edit click
    const handleEditDialogOpen = () => {
        setValue('title', studyItem.title);
        setValue('category', studyItem.category);
        setValue('content', studyItem.content);
        setValue('scheduled_date', defaultScheduledDate);
        setEditDialogOpen(true);
    };

    //Edit study item submission
    const onEditSubmit = async data => {
        console.log("Edit Function called");
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/study/edit/${studyItem.id_study}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Ensures the request includes the cookie
                body: JSON.stringify({
                    title: data.title,
                    category: data.category,
                    content: data.content,
                    scheduled_date: data.scheduled_date
                })
            });

            if (response.ok) {
                const updatedStudyItem = await response.json();
                const index = studyItems.findIndex(item => item.id_study === studyItem.id_study);
                if (index !== -1) {
                    const newStudyItems = [...studyItems];
                    newStudyItems[index] = updatedStudyItem;
                    setStudyItems(newStudyItems);
                }

                setSnackbarMessage('Study item updated successfully');
                setSnackbarSeverity('success');
            } else {
                const error = await response.text();
                throw new Error(error);
            }
        } catch (err) {
            console.error(err.message);
            setSnackbarMessage(err.message || 'Error updating study item');
            setSnackbarSeverity('error');
        }

        setEditDialogOpen(false);
        setSnackbarOpen(true);
    };

    //handle Finished status change
    const handleFinishedClick = () => {
        setNewStatus('Finished');
        setReviewDialogOpen(true);
    };

    const confirmReviewModelAfterFinish = async data => {
        console.log("Finished and review Function called");
        confirmStatusChange();
        const formattedData = {
            category: category,
            title: title,
            content: content,
            review_pattern: data.review_pattern,
            firstReviewDate: data.firstReviewDate,
        }

        console.log(formattedData);

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Ensures the request includes the cookie
                body: JSON.stringify(formattedData)
            });

            if (response.ok) {
                setSnackbarMessage('Review item created successfully');
                setSnackbarSeverity('success');
            };
        } catch (err) {
            console.error(err.message);
            setSnackbarMessage(err.message || 'Error updating study item');
            setSnackbarSeverity('error');

        }
        setSnackbarOpen(true);
        setReviewDialogOpen(false);
        setNewStatus(null);

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
                            {content.length > 200 && <Button onClick={handleReadMoreDialogOpen}>Read More</Button>}
                        </Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="space-between" alignItems="center" marginTop={1}>
                        <Box>
                            <Typography variant="body2" color="text.secondary">{`Created: ${formattedCreateDate}`}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {status === "Scheduled" ? `Scheduled: ${statusDate}` : status === "Finished" ? `Finished: ${statusDate}` : `Canceled: ${statusDate}`}
                                {status === "Scheduled" && isOverdue(new Date(scheduled_date)) && 
                                <Typography variant="body2" color="error">Overdue</Typography>}
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" marginLeft={2}>{status}</Typography>
                    </Box>

                    {/* Action button */}
                    <Box display="flex" justifyContent="flex-end" marginTop={1}>
                        {status === 'Scheduled' && <Button size="small" variant="outlined" color="success" onClick={handleFinishedClick}>Finish</Button>}
                        {status === 'Scheduled' && <Button size="small" variant="outlined" color="error" onClick={() => handleStatusChange('Canceled')}>Cancel</Button>}
                        {status === 'Scheduled' && <Button size="small" variant="outlined" color="primary" onClick={handleEditDialogOpen}>Edit</Button>}
                        {status !== 'Scheduled' && <Chip label="ARCHIEVED" style={{ backgroundColor: '#eeeeee' }} />}
                    </Box>
                </CardContent>
            </Card>

            {/* dialog for read more */}
            <Dialog open={readMoreDialogOpen} onClose={() => setReadMoreDialogOpen(false)}>
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
                    <Box display="flex" justifyContent="space-between" alignItems="center" marginTop={1}>
                        <Box>
                            <Typography variant="body2" color="text.secondary">{`Created: ${formattedCreateDate}`}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {status === "Scheduled" ? `Scheduled: ${statusDate}` : status === "Finished" ? `Finished: ${statusDate}` : `Canceled: ${statusDate}`}
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" marginLeft={2}>{status}</Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReadMoreDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* dialog for status change */}
            <Dialog open={confirmStatusChangeOpen} onClose={() => setConfirmStatusChangeOpen(false)}>
                <DialogTitle>Confirm Status Change</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" color="text.secondary">
                        {`Are you sure you want to change the status to ${newStatus}?`}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelStatusChange}>Cancel</Button>
                    <Button onClick={confirmStatusChange}>Confirm</Button>
                </DialogActions>
            </Dialog>

            {/* dialog for edit */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle style={{ textAlign: 'center' }}>Edit Study Item</DialogTitle>
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
                        <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                        <Button type="submit">Edit</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* dialog for finish status change and create review */}
            <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)}>
                <DialogTitle style={{ textAlign: 'center', paddingBottom: '0px' }}>Confirm Finished Status</DialogTitle>
                <form onSubmit={reviewHandleSubmit(confirmReviewModelAfterFinish)}>
                    <DialogContent>
                        <Typography variant="body2" gutterBottom align="left">
                            Please select the review pattern after you finish this study item.
                        </Typography>
                        <Typography variant="body2" gutterBottom align="left" mb={2}>
                            The system will automatically create review sessions for you.
                        </Typography>
                        <FormControl fullWidth margin="dense">
                            <InputLabel id="review-pattern-label">Review Pattern</InputLabel>
                            <Select
                                labelId="review-pattern-label"
                                {...reviewRegister('review_pattern', { required: "Review Pattern is required" })}
                                error={!!reviewErrors.review_pattern}
                                label="Review Pattern"
                                value={selectedReviewPattern}
                                onChange={(e) => setSelectedReviewPattern(e.target.value)}
                            >
                                <MenuItem value="Simple">Default - Simple (1st, 3rd, 7th days)</MenuItem>
                                <MenuItem value="Normal">Default - Normal (1st, 2nd, 4th, 7th, 14th days)</MenuItem>
                                <MenuItem value="Custom">Custom</MenuItem>
                                <MenuItem value="No-Arrangement">No review arrangement</MenuItem>
                            </Select>
                            {reviewErrors.review_pattern && <p>{reviewErrors.review_pattern.message}</p>}
                        </FormControl>
                        {selectedReviewPattern === 'Custom' && (
                            <TextField
                                margin="dense"
                                label="First Review Session Date"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                {...reviewRegister('firstReviewDate', {
                                    required: "First Review Session Date is required",
                                    validate: {
                                        isFuture: value => {
                                            const inputDate = new Date(value);
                                            const todaysDate = new Date();
                                            inputDate.setHours(0, 0, 0, 0);
                                            todaysDate.setHours(0, 0, 0, 0);
                                            return inputDate >= todaysDate || 'The date should not be in the past';
                                        }
                                    }
                                })}
                                error={!!reviewErrors.firstReviewDate}
                                helperText={reviewErrors.firstReviewDate?.message}
                            />
                        )}
                        {selectedReviewPattern === 'Custom' && (
                            <Typography variant="body2" gutterBottom align="left">
                                You can add more review sessions later.
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button type="submit">Confirm</Button>
                        <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
                    </DialogActions>
                </form>
            </Dialog>


        </Box>

    );
}

export default StudyTask;

