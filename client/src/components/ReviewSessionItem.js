import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';


function ReviewSessionItem({ session, sessionNumber, setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen, displayedReviewItems, setDisplayedReviewItems }) {

  const [sessionStatus, setSessionStatus] = useState(session.status); 
  const [newStatus, setNewStatus] = useState(null);
  const [confirmStatusChangeOpen, setConfirmStatusChangeOpen] = useState(false);

  const handleStatusChange = (selectedStatus) => {
    setNewStatus(selectedStatus);
    setConfirmStatusChangeOpen(true);
  };


  //Session Status(canceled and finished) change confirmation submission
  const confirmStatusChange = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/session/change-status/${session.id_session}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Ensures the request includes the cookie
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            const updatedSessionItem = await response.json();
            setSessionStatus(updatedSessionItem.status);

            setSnackbarMessage('Review session status updated successfully');
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

  const cancelStatusChange = () => {
    setNewStatus(null);
    setConfirmStatusChangeOpen(false);
  };

  return (
    <Box display="flex" justifyContent="space-between" flexgrow={1} marginTop={1}>
      <Box display="flex" flexDirection="column">
        <Typography variant="body2" color="text.secondary">
          {`Session ${sessionNumber}`}
        </Typography>
        {/* <Typography variant="body2" color="text.secondary">{`Created: ${formattedCreateDate}`}</Typography> */}
        {sessionStatus === "Scheduled" &&
          <Typography variant="body2" color="text.secondary">{`Scheduled: ${new Date(session.scheduled_date).toLocaleDateString()}`}</Typography>}
        {sessionStatus !== "Scheduled" &&
          <Typography variant="body2" color="text.secondary">{`${sessionStatus}: ${new Date(session.finished_date).toLocaleDateString()}`}</Typography>}
      </Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        {sessionStatus === "Scheduled" &&
          <Box display="flex" justifyContent="flex-end" alignItems="center">
            <Button variant="outlined" color="success" size="small" onClick={() => handleStatusChange('Finished')}>Finish</Button>
            <Button variant="outlined" color="error" size="small" onClick={() => handleStatusChange('Canceled')}>Cancel</Button>
          </Box>}
        {sessionStatus !== "Scheduled" &&
          <Typography variant="body2" color="text.secondary">{sessionStatus}</Typography>}
      </Box>

{/* dialog for session status change */}
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

    </Box>



  );
}

export default ReviewSessionItem;
