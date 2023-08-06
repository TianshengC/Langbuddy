import { useEffect, useState } from 'react';
import Box from '@mui/system/Box';
import { TextField, Button } from '@mui/material';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Chatbox from '../components/Chatbox';
import testMessages from '../utils/testChatMessages';
import studyItems from '../utils/studyItems';
import StudyTask from '../components/StudyTask';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';

function ChatBuddy() {

    const [messages, setMessages] = useState(testMessages);
    const [newMessage, setNewMessage] = useState(null);
    const [todayStudyItems, setTodayStudyItems] = useState(studyItems);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const handleMessageChange = (event) => {
        setNewMessage(event.target.value);
    };

    const handleSendMessage = () => {
        //  replace this with the actual API call
        setMessages([...messages, { user: 'You', text: newMessage }]);
        setNewMessage("");
    };

    useEffect(() => {
        //  replace this with the actual API call
        setTodayStudyItems(studyItems);
    }, []);

    return (
        <Box display="flex" justifyContent="center" alignItems="start">
            {/* Left Side: Chatbuddy. Important: display flex && column-reverse */}
            <Box flexGrow={1} pr={2} style={{ position: 'relative', marginLeft:'100px' }}>
                <Paper elevation={3} style={{ height: 'calc(100vh - 120px)', overflow: 'auto', marginTop: '0px', marginBottom: '0px', padding: '0px', display:'flex', flexDirection:'column-reverse', justifyContent:'space-between' }} >
                    <Box display="flex" flexDirection="column" alignItems="center" mt={2} px={2}>
                        <Box width="100%" display="flex" justifyContent="space-between">
    
                            <TextField
                                variant="outlined"
                                value={newMessage}
                                onChange={handleMessageChange}
                                multiline
                                fullWidth
                                maxRows={4}
                                style={{ flexGrow: 1, maxHeight: '150px', overflow: 'auto' }}
                            />
    
                            <Box display="flex" justifyContent="flex-end" alignItems="center" ml={2}>
                                <Button variant="contained" color="primary" onClick={handleSendMessage}>
                                    Send
                                </Button>
                                <Button variant="contained" color="secondary" style={{ marginLeft: '10px' }}>
                                    Record
                                </Button>
                            </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" style={{ margin: 0 }}>Chatbuddy may produce inaccurate information about people, places, or facts.</Typography>
                    </Box>
                    <Box  display="flex" flexDirection="column" justifyContent="flex-start" alignItems="center" style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
                        {messages.map((message, index) => (
                           <Chatbox key={index} message={message} />
                        ))}
                    </Box>
                </Paper>
            </Box>
    
            {/* Right Side: Study and Review Tasks */}
            <Box flexShrink={0} width={300} pr={2}>
                <Paper elevation={3} style={{ height: 'calc(100vh - 120px)', overflow: 'auto', marginTop: '0px', marginBottom: '0px' }} >
                <Box display='flex'  justifyContent='center' alignContent='center' sx={{p:1}}>
                <Typography variant='h5' align='center' style={{ fontWeight: 'bold' }}>Task today!</Typography><LocalLibraryIcon style={{ fontSize: '30px', marginTop:'0px'}}/>
                </Box>
                <Divider />
                <Grid container spacing={0}>
                <Divider />
                        {todayStudyItems.map((studyItem, index) => (
                            <Grid item xs={12} sm={12} md={12}>
                            <StudyTask
                                key={index}
                                studyItem={studyItem}
                                studyItems={todayStudyItems}
                                setStudyItems={setTodayStudyItems}
                                setSnackbarOpen={setSnackbarOpen}
                                setSnackbarMessage={setSnackbarMessage}
                                setSnackbarSeverity={setSnackbarSeverity}
                            />
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            </Box>
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
        </Box>
    );
}


export default ChatBuddy;