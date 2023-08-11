import { useEffect, useState } from 'react';
import Box from '@mui/system/Box';
import { TextField, Button } from '@mui/material';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Chatbox from '../components/Chatbox';
import StudyTask from '../components/StudyTask';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ReviewTask from '../components/ReviewTask';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import CircularProgress from '@mui/material/CircularProgress';
import { DisabledButton } from '../components/Buttons';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';


function ChatBuddy() {

    const [messages, setMessages] = useState([{ "role": "chatbot", "content": "Hello, how can I help you today?" }]);
    const [newContent, setNewContent] = useState("");
    const [todayStudyItems, setTodayStudyItems] = useState([]);
    const [todayReviewItems, setTodayReviewItems] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [loadingStudyItems, setLoadingStudyItems] = useState(true);
    const [loadingReviewItems, setLoadingReviewItems] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [loadingSendMessage, setLoadingSendMessage] = useState(false);
    const [loadingVoiceRecognition, setLoadingVoiceRecognition] = useState(false);
    const [loadingNewTopic, setLoadingNewTopic] = useState(false);
    const [openNewTopicDialog, setOpenNewTopicDialog] = useState(false);
    const [newTopicInput, setNewTopicInput] = useState('');
    const [inputError, setInputError] = useState(false);

    useEffect(() => {
        // get the study items for today
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
                    setLoadingStudyItems(false);
                } else {
                    const error = await response.text();
                    throw new Error(error);
                }

            } catch (error) {
                console.log(error);
                setSnackbarOpen(true);
                setSnackbarMessage(error.message);
                setSnackbarSeverity('error');
            }
        }

        //get review items for today
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
                    setLoadingReviewItems(false);
                } else {
                    const error = await response.text();
                    throw new Error(error);
                }


            } catch (error) {
                console.log(error);
                setSnackbarOpen(true);
                setSnackbarMessage(error.message);
                setSnackbarSeverity('error');
            }
        }

        //load the history of messages
        const getMessages = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/chatbot`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    setMessages(data);
                    setLoadingMessages(false);
                } else {
                    const error = await response.text();
                    throw new Error(error);
                }


            } catch (error) {
                console.log(error);
                setSnackbarOpen(true);
                setSnackbarMessage(error.message);
                setSnackbarSeverity('error');
            }
        }

        getMessages();
        getTodayStudyItems();
        getTodayReviewItems();
    }, []);

    //send message to chatbot
    const handleSendMessage = async () => {
        try {
            setLoadingSendMessage(true);
            if (!newContent) {
                throw new Error('Please enter a message.');
            }

            const tempUserMessage = { "role": "user", "content": newContent };
            setMessages(prevMessages => [...prevMessages, tempUserMessage]);
            setNewContent("");
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/chatbot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content: newContent })
            });

            if (response.ok) {
                const aiMessage = await response.json();
                setMessages(prevMessages => [...prevMessages, aiMessage]);

            } else {
                const error = await response.text();
                console.log(error);
                throw new Error(error);
            }

        } catch (error) {
            console.log(error);
            setSnackbarOpen(true);
            setSnackbarMessage(error.message);
            setSnackbarSeverity('error');
        } finally {
            setLoadingSendMessage(false);
        }
    };

    //record audio input
    const startVoiceRecognition = () => {
        if (!('webkitSpeechRecognition' in window)) {
            setSnackbarOpen(true);
            setSnackbarMessage('Speech recognition not supported in this browser.');
            setSnackbarSeverity('error');
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onstart = function () {
            console.log('Voice recognition started. Speak into the microphone.');
            setLoadingVoiceRecognition(true);
        };

        recognition.onresult = function (event) {
            const speechResult = event.results[0][0].transcript;
            setNewContent(speechResult); // Setting the recognized speech to the text area
            setLoadingVoiceRecognition(false);
        };

        recognition.onerror = function (event) {
            setSnackbarOpen(true);
            setSnackbarMessage('Error occurred in recognition: ' + event.error);
            setSnackbarSeverity('error');
            setLoadingVoiceRecognition(false);
        }

        recognition.onend = function () {
            console.log('Voice recognition ended.');
            setLoadingVoiceRecognition(false);
        };

        recognition.start();
    }

    //manage topic input dialog open and close
    const handleOpenDialog = () => {
        setOpenNewTopicDialog(true);
    }

    const handleCloseDialog = () => {
        setOpenNewTopicDialog(false);
        setNewTopicInput('');
    }


    //create new topic
    const sendNewTopic = async () => {
        // Exit the function if the input is empty
        if (newTopicInput.trim() === '') {
            setInputError(true);
            return; 
        }

        try {
            setLoadingNewTopic(true);
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/chatbot/new-topic`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content: newTopicInput })
            });

            if (response.ok) {
                const newTopic = await response.json();
                setMessages(prevMessages => [...prevMessages, newTopic]);
            } else {
                const error = await response.text();
                console.log(error);
                throw new Error(error);
            }

        } catch (error) {
            console.log(error);
            setSnackbarOpen(true);
            setSnackbarMessage(error.message);
            setSnackbarSeverity('error');
        } finally {
            setLoadingNewTopic(false);
            setNewTopicInput('');
            setOpenNewTopicDialog(false);
        }
    }



    if (loadingStudyItems || loadingReviewItems || loadingMessages) {
        return null;
    }

    return (
        <Box display="flex" justifyContent="center" alignItems="start">
            {/* Left Side: Chatbuddy. Important: display flex && column-reverse */}
            <Box flexGrow={1} pr={2} style={{ position: 'relative', marginLeft: '100px' }}>
                <Paper elevation={3} style={{ height: 'calc(100vh - 120px)', overflow: 'auto', marginTop: '0px', marginBottom: '0px', padding: '0px', display: 'flex', flexDirection: 'column-reverse', justifyContent: 'space-between' }} >
                    <Box display="flex" flexDirection="column" alignItems="center" mt={2} px={2}>
                        <Box width="100%" display="flex" justifyContent="space-between">

                            <TextField
                                variant="outlined"
                                value={newContent}
                                onChange={(event) => setNewContent(event.target.value)}
                                multiline
                                fullWidth
                                maxRows={4}
                                placeholder={
                                    loadingVoiceRecognition ? 'Voice recognition started. Recording...' :
                                        loadingSendMessage ? 'Waiting for Chatbot reply...' :
                                            setLoadingNewTopic ? 'Creating new topic' : 'Type your message...'
                                }
                                disabled={loadingVoiceRecognition || loadingSendMessage}
                                style={{ flexGrow: 1, maxHeight: '150px', overflow: 'auto', backgroundColor: loadingVoiceRecognition || loadingSendMessage ? '#f5f5f5' : 'transparent' }}
                            />

                            <Box display="flex" justifyContent="flex-end" alignItems="center" ml={2}>

                                <DisabledButton variant="contained" color="primary" onClick={startVoiceRecognition} disabled={loadingVoiceRecognition} >
                                    {loadingVoiceRecognition ? <CircularProgress size={23} color="inherit" /> : <MicRoundedIcon />}
                                </DisabledButton>
                                <DisabledButton variant="contained" color="primary" onClick={handleSendMessage} style={{ marginLeft: '10px' }} disabled={loadingSendMessage} >
                                    {loadingSendMessage ? <CircularProgress size={23} color="inherit" /> : <SendRoundedIcon />}
                                </DisabledButton>
                                <DisabledButton variant="contained" color="primary" onClick={handleOpenDialog} style={{ marginLeft: '10px' }} disabled={loadingNewTopic} >
                                    {loadingNewTopic ? <CircularProgress size={23} color="inherit" /> : <AutoFixHighIcon />}
                                </DisabledButton>
                            </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" style={{ margin: 0 }}>Chatbuddy may produce inaccurate information about people, places, or facts.</Typography>
                    </Box>
                    <Box display="flex" flexDirection="column" justifyContent="flex-start" alignItems="center" style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
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
                    <Box display='flex' justifyContent='center' alignContent='center' sx={{ p: 1 }}>
                        <Typography variant='h5' align='center' style={{ fontWeight: 'bold' }}>Task today!</Typography><LocalLibraryIcon style={{ fontSize: '30px', marginTop: '0px' }} />
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

            {/* dialog for creating new topic */}
            <Dialog open={openNewTopicDialog} onClose={handleCloseDialog} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">New Topic</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter the new topic below:
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="New Topic"
                        type="text"
                        fullWidth
                        value={newTopicInput}
                        onChange={e => {setNewTopicInput(e.target.value);
                        setInputError(false)}}
                        error={inputError}
                        helperText={inputError ? "Topic cannot be empty" : ""}
                    />
                    
                </DialogContent>
                <DialogActions>
                    <Button onClick={sendNewTopic} color="primary">
                        Confirm
                    </Button>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>

                </DialogActions>
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
        </Box>
    );
}


export default ChatBuddy;