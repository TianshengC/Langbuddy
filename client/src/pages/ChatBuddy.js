import { useEffect, useState } from 'react';
import Box from '@mui/system/Box';
import { TextField, Button, Tooltip } from '@mui/material';
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
import { set } from 'react-hook-form';


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
    const [loadingConversationPoints, setLoadingConversationPoints] = useState(true);
    const [loadingSendMessage, setLoadingSendMessage] = useState(false);
    const [loadingVoiceRecognition, setLoadingVoiceRecognition] = useState(false);
    const [loadingNewTopic, setLoadingNewTopic] = useState(false);
    const [openNewTopicDialog, setOpenNewTopicDialog] = useState(false);
    const [newTopicInput, setNewTopicInput] = useState('');
    const [inputError, setInputError] = useState(false);
    const [selectedChatbot, setSelectedChatbot] = useState('Ada');
    const [selectedChatbotDetails, setSelectedChatbotDetails] = useState('Ada is a helpful and encouraging assistant who teach English as a secondary language. She can provide useful learning tips and correct the your mistakes.');
    const [numOfConversationPoints, setNumOfConversationPoints] = useState(50);


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

        //get the number of conversation points
        const getNumberOfConversationPoints = async () => {
            try {
                console.log("Fetching conversation points...");
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/conversation-points`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    setNumOfConversationPoints(data.conversationPoints);
                    setLoadingConversationPoints(false);
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


        getTodayStudyItems();
        getTodayReviewItems();
        getNumberOfConversationPoints();
    }, []);

    //update chatbot details and chat history when chatbot is changed
    useEffect(() => {
        // load the history of messages
        const getMessages = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/chatbot/${selectedChatbot}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
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

        switch (selectedChatbot) {
            case 'Ada':
                setSelectedChatbotDetails("Ada is a helpful and encouraging assistant who teach English as a secondary language. She can provide useful learning tips and correct the your mistakes. (Female, American Accent.)");
                break;
            case 'Sam':
                setSelectedChatbotDetails('Sam specializes in teaching English vocabulary with examples. He also suggests useful learning strategy to learn English. (Male, American Accent.)');
                break;
            case 'Lucy':
                setSelectedChatbotDetails("Lucy is passionate about sharing UK culture. She is an expert in introducing UK customs and history. (Female, British Accent.)");
                break;
            case 'Jack':
                setSelectedChatbotDetails('Jack is an interview and career coach. His style is sympathetic and encouraging. (Male, British Accent.)');
                break;
            default:
                setSelectedChatbotDetails('Ada is a helpful and encouraging assistant who teach English as a secondary language. She can provide useful learning tips and correct the your mistakes. (Female, American Accent.)');
                break;
        }
    }, [selectedChatbot]);


    //send message to chatbot
    const handleSendMessage = async () => {
        try {
            setLoadingSendMessage(true);
            if (!newContent) {
                throw new Error('Please enter a message.');
            }

            if (numOfConversationPoints <= 0) {
                throw new Error('You have run out of conversation points. Please wait for the next day to continue.');
            }

            const tempUserMessage = { "role": "user", "content": newContent };
            setMessages(prevMessages => [...prevMessages, tempUserMessage]);
            setNewContent("");
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/chatbot/${selectedChatbot}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content: newContent })
            });

            if (response.ok) {
                const responseData = await response.json();
                setMessages(prevMessages => [...prevMessages, responseData.aiMessage]);
                setNumOfConversationPoints(responseData.updatedConversationPoints);
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
            setNewContent('');
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
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/chatbot/new-topic/${selectedChatbot}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content: newTopicInput })
            });

            if (response.ok) {
                const newTopic = await response.json();
                console.log(newTopic);
                setMessages(prevMessages => [...prevMessages, ...newTopic]);
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



    if (loadingStudyItems || loadingReviewItems || loadingMessages || loadingConversationPoints) {
        return null;
    }

    return (
        <Box display="flex" justifyContent="center" alignItems="start">

            {/* New Left Side: Chatbot Selection */}
            <Box display="flex" flexDirection="column" alignItems="center" flexShrink={0} width={200} >
                {/* Chatbot buttons */}
                <Box display="flex" flexDirection="column" mb={2} mt={5} pr={1}>
                    <Button
                        variant={selectedChatbot === 'Ada' ? 'contained' : 'outlined'}
                        color={selectedChatbot === 'Ada' ? 'primary' : 'default'}
                        onClick={() => setSelectedChatbot('Ada')}>Ada</Button>
                    <Button
                        variant={selectedChatbot === 'Sam' ? 'contained' : 'outlined'}
                        color={selectedChatbot === 'Sam' ? 'primary' : 'default'}
                        onClick={() => setSelectedChatbot('Sam')}>Sam</Button>
                    <Button
                        variant={selectedChatbot === 'Lucy' ? 'contained' : 'outlined'}
                        color={selectedChatbot === 'Lucy' ? 'primary' : 'default'}
                        onClick={() => setSelectedChatbot('Lucy')}>Lucy</Button>
                    <Button
                        variant={selectedChatbot === 'Jack' ? 'contained' : 'outlined'}
                        color={selectedChatbot === 'Jack' ? 'primary' : 'default'}
                        onClick={() => setSelectedChatbot('Jack')}>Jack</Button>
                </Box>

                {/* Chatbot Details */}
                <Box>
                    <Typography variant="h6">Chatbot Details:</Typography>
                    <Typography variant="body1">{selectedChatbotDetails}</Typography>
                </Box>
            </Box>
            {/* Middle Side: Chatbuddy. Important: display flex && column-reverse */}
            <Box flexGrow={1} style={{ position: 'relative', marginLeft: '20px', marginRight: '20px' }}>
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
                                            loadingNewTopic ? 'Creating new topic' : 'Type your message...'
                                }
                                disabled={loadingVoiceRecognition || loadingSendMessage}
                                style={{ flexGrow: 1, maxHeight: '150px', overflow: 'auto', backgroundColor: loadingVoiceRecognition || loadingSendMessage ? '#f5f5f5' : 'transparent' }}
                            />

                            <Box display="flex" flexDirection="column" justifyContent="flex-end" alignItems="flex-end" ml={2}>
                                <Box display="flex" alignItems="center">
                                    <Tooltip title="Start Recording" placement="top" arrow>
                                        <DisabledButton variant="contained" color="primary" 
                                        onClick={startVoiceRecognition} 
                                        disabled={loadingVoiceRecognition}>
                                            {loadingVoiceRecognition ? <CircularProgress size={23} color="inherit" /> : <MicRoundedIcon />}
                                        </DisabledButton>
                                    </Tooltip>
                                    <Tooltip title="Send Message" placement="top" arrow>
                                        <DisabledButton variant="contained" color="primary" onClick={handleSendMessage} style={{ marginLeft: '10px' }} disabled={loadingSendMessage}>
                                            {loadingSendMessage ? <CircularProgress size={23} color="inherit" /> : <SendRoundedIcon />}
                                        </DisabledButton>
                                    </Tooltip>
                                    <Tooltip title="New Topic" placement="top" arrow>
                                        <DisabledButton variant="contained" color="primary" onClick={handleOpenDialog} style={{ marginLeft: '10px' }} disabled={loadingNewTopic}>
                                            {loadingNewTopic ? <CircularProgress size={23} color="inherit" /> : <AutoFixHighIcon />}
                                        </DisabledButton>
                                    </Tooltip>
                                </Box>

                                {/* New sentence added here */}
                                <Typography variant="body2" style={{ marginTop: '8px', textAlign: 'center', width: '100%' }}>
                                    Conversation points: {numOfConversationPoints}
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" style={{ margin: 0 }}>Chatbuddy may produce inaccurate information about people, places, or facts.</Typography>
                    </Box>
                    <Box display="flex" flexDirection="column" justifyContent="flex-start" alignItems="center" style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
                        {messages.map((message, index) => (
                            <Chatbox
                                key={index}
                                message={message}
                                selectedChatbot={selectedChatbot}
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
            <Box flexShrink={0} width={320} pr={2}>
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
                        onChange={e => {
                            setNewTopicInput(e.target.value);
                            setInputError(false)
                        }}
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