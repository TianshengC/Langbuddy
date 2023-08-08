import { useEffect, useState } from 'react';
import Box from '@mui/system/Box';
import { TextField, Button } from '@mui/material';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Chatbox from '../components/Chatbox';
import testMessages from '../utils/testChatMessages';
import StudyTask from '../components/StudyTask';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ReviewTask from '../components/ReviewTask';

function ChatBuddy() {

    const [messages, setMessages] = useState([{"role":"chatbot","content":"Hello, how can I help you today?"}]);
    const [newContent, setNewContent] = useState("");
    const [todayStudyItems, setTodayStudyItems] = useState([]);
    const [todayReviewItems, setTodayReviewItems] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [loadingStudyItems, setLoadingStudyItems] = useState(true);
    const [loadingReviewItems, setLoadingReviewItems] = useState(true);



    useEffect( () => {
        const getTodayStudyItems = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/study/today`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setTodayStudyItems(data);
                }else{
                    const error = await response.text();
                    throw new Error(error);
                }
            } catch (error) {
                console.log(error);
                setSnackbarOpen(true);
                setSnackbarMessage(error.message);
                setSnackbarSeverity('error');
            }finally{
                setLoadingStudyItems(false);
            }
    }

        const getTodayReviewItems = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/review/today`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    setTodayReviewItems(data);
                }else{
                    const error = await response.text();
                    throw new Error(error);
                }
            } catch (error) {
                console.log(error);
                setSnackbarOpen(true);
                setSnackbarMessage(error.message);
                setSnackbarSeverity('error');
            }finally{
                setLoadingReviewItems(false);
            }
        }
        
        getTodayStudyItems();
        getTodayReviewItems();
    }, []);

    const handleSendMessage = async () => {
        try {
            if (!newContent) {
                throw new Error('Please enter a message.');
            }

            const tempUserMessage = {"role":"user","content":newContent};
            setMessages(prevMessages => [...prevMessages, tempUserMessage]);
            setNewContent("");
            const response= await fetch(`${process.env.REACT_APP_BACKEND_URL}/chatbot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content: newContent })
            });

            if (response.ok) {
                const aiMessage = await response.json();
                setMessages(prevMessages => [...prevMessages, aiMessage]);
                
            }else{
                const error = await response.text();
                console.log(error);
                throw new Error(error);
            }

        } catch (error) {
            console.log(error);
            setSnackbarOpen(true);
            setSnackbarMessage(error.message);
            setSnackbarSeverity('error');
        }
    };

    if(loadingStudyItems || loadingReviewItems){
        return null;
    }

    return (
        <Box display="flex" justifyContent="center" alignItems="start">
            {/* Left Side: Chatbuddy. Important: display flex && column-reverse */}
            <Box flexGrow={1} pr={2} style={{ position: 'relative', marginLeft:'100px' }}>
                <Paper elevation={3} style={{ height: 'calc(100vh - 120px)', overflow: 'auto', marginTop: '0px', marginBottom: '0px', padding: '0px', display:'flex', flexDirection:'column-reverse', justifyContent:'space-between' }} >
                    <Box display="flex" flexDirection="column" alignItems="center" mt={2} px={2}>
                        <Box width="100%" display="flex" justifyContent="space-between">
    
                            <TextField
                                variant="outlined"
                                value={newContent}
                                onChange={(event) => setNewContent(event.target.value)}
                                multiline
                                fullWidth
                                maxRows={4}
                                placeholder='Type your message...'
                                style={{ flexGrow: 1, maxHeight: '150px', overflow: 'auto' }}
                            />
    
                            <Box display="flex" justifyContent="flex-end" alignItems="center" ml={2}>

                                <Button variant="contained" color="primary" >
                                    Record
                                </Button>
                                <Button variant="contained" color="primary" onClick={handleSendMessage} style={{ marginLeft: '10px' }}>
                                    Send
                                </Button>
                            </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" style={{ margin: 0 }}>Chatbuddy may produce inaccurate information about people, places, or facts.</Typography>
                    </Box>
                    <Box  display="flex" flexDirection="column" justifyContent="flex-start" alignItems="center" style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
                        {messages.map((message, index) => (
                           <Chatbox 
                            key={index} 
                            message={message} 
                            setSnackbarMessage={setSnackbarMessage}
                            setSnackbarOpen={setSnackbarOpen}
                            setSnackbarSeverity={setSnackbarSeverity}
                            setTodayReviewItems={setTodayReviewItems}
                            />
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
                            <Grid item xs={12} key={index}>
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
                        {todayReviewItems.map((reviewItem, index) => (
                            <Grid item xs={12} key={index}>
                            <ReviewTask
                                key={index}
                                reviewItem={reviewItem}
                                displayedReviewItems={todayReviewItems}
                                setDisplayedReviewItems={setTodayReviewItems}
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