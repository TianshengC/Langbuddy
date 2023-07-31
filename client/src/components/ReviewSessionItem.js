import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';



function ReviewSessionItem({ session, sessionNumber }) {

  return (
    <Box display="flex" justifyContent="space-between" flexgrow={1} marginTop={1}>
      <Box display="flex" flexDirection="column">
        <Typography variant="body2" color="text.secondary">
          {`Session ${sessionNumber}`}
        </Typography>
        {/* <Typography variant="body2" color="text.secondary">{`Created: ${formattedCreateDate}`}</Typography> */}
        {session.status === "Scheduled" && 
          <Typography variant="body2" color="text.secondary">{`Scheduled: ${new Date(session.scheduled_date).toLocaleDateString()}`}</Typography>}
        {session.status !== "Scheduled" && 
          <Typography variant="body2" color="text.secondary">{`${session.status}: ${new Date(session.finished_date).toLocaleDateString()}`}</Typography>}
      </Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center">
      {session.status === "Scheduled" && 
        <Box display="flex" justifyContent="flex-end"  alignItems="center">
          <Button variant="outlined" color="success" size="small" onClick={() => {}}>Finish</Button>
          <Button variant="outlined" color="error" size="small" onClick={() => {}}>Cancel</Button>
        </Box>}
      {session.status !== "Scheduled" && 
        <Typography variant="body2" color="text.secondary">{session.status}</Typography>}
        </Box>
    </Box>
  );
}

export default ReviewSessionItem;
