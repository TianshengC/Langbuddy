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



function StudyTask({
    studyItem,
    studyItems,
    setStudyItems,
    snackbarOpen,
    setSnackbarOpen,
    snackbarMessage,
    setSnackbarMessage,
    snackbarSeverity,
    setSnackbarSeverity, s
}) {
    const { category, title, content, created_date, scheduled_date, finished_date, status } = studyItem;

    const formattedCreateDate = new Date(created_date).toLocaleDateString();
    const formattedScheduledDate = new Date(scheduled_date).toLocaleDateString();
    const formattedFinishedDate = finished_date ? new Date(finished_date).toLocaleDateString() : null;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [confirmStatusChangeOpen, setConfirmStatusChangeOpen] = useState(false);
    const [newStatus, setNewStatus] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();

    const handleDialogOpen = () => {
        setDialogOpen(true);
    };

    const handleEditDialogOpen = () => {
        setValue('title', studyItem.title);
        setValue('category', studyItem.category);
        setValue('content', studyItem.content);
        setValue('scheduled_date', formatDate(studyItem.scheduled_date));
        setEditDialogOpen(true);
    };


    const displayContent = content.length > 200 ? content.substring(0, 200) + "..." : content;

    const statusDate = status === "Scheduled" ? formattedScheduledDate : formattedFinishedDate;

    const handleStatusChange = (status) => {
        setNewStatus(status);
        setConfirmStatusChangeOpen(true);
    };

    const cancelStatusChange = () => {
        setNewStatus(null);
        setConfirmStatusChangeOpen(false);
    };

//Status(canceled and finished) confirmation submission
    const confirmStatusChange = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/study/status/${studyItem.id_study}`, {
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
            setSnackbarMessage('Error updating study item');
            setSnackbarSeverity('error');
        }

        setConfirmStatusChangeOpen(false);
        setNewStatus(null);
        setSnackbarOpen(true);
    };


//Edit study item submission
    const onEditSubmit = async data => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/study/${studyItem.id_study}`, {
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
            setSnackbarMessage('Error updating study item');
            setSnackbarSeverity('error');
        }

        setEditDialogOpen(false);
        setSnackbarOpen(true);
    };


    return (
        <Grid item xs={12} sm={6} md={4}>
            <Card elevation={4} style={{ border: '1px solid #ddd' }} sx={{ mt: 2 }}>
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
                    <Box display="flex" justifyContent="space-between" alignItems="center" marginTop={1}>
                        <Box>
                            <Typography variant="body2" color="text.secondary">{`Created: ${formattedCreateDate}`}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {status === "Scheduled" ? `Scheduled: ${statusDate}` : status === "Finished" ? `Finished: ${statusDate}` : `Canceled: ${statusDate}`}
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" marginLeft={2}>{status}</Typography>
                    </Box>

{/* Action button */}
                    <Box display="flex" justifyContent="flex-end" marginTop={1}>
                        {status === 'Scheduled' && <Button size="small" variant="outlined" color="success" onClick={() => handleStatusChange('Finished')}>Finish</Button>}
                        {status === 'Scheduled' && <Button size="small" variant="outlined" color="error" onClick={() => handleStatusChange('Canceled')}>Cancel</Button>}
                        {status === 'Scheduled' && <Button size="small" variant="outlined" color="primary" onClick={handleEditDialogOpen}>Edit</Button>}
                        {status !== 'Scheduled' && <Chip label="ARCHIEVED" style={{backgroundColor: '#eeeeee'}} />}
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
                    <Button onClick={() => setDialogOpen(false)}>Close</Button>
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
        </Grid>
    );
}

export default StudyTask;

