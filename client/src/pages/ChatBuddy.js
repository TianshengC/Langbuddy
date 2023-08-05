import { useState } from 'react';
import Box from '@mui/system/Box';
import { List, ListItem, ListItemText, TextField, Button } from '@mui/material';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

function ChatBuddy() {

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const handleMessageChange = (event) => {
        setNewMessage(event.target.value);
    };

    const handleSendMessage = () => {
        //  replace this with the actual API call
        setMessages([...messages, { user: 'You', text: newMessage }]);
        setNewMessage("");
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="start">
            {/* Left Side: Chatbuddy */}
            <Box flexGrow={1} pr={2} style={{ position: 'relative' }}>
                <Paper elevation={3} style={{ height: 'calc(100vh - 120px)', overflow: 'auto', marginTop: '0px', marginBottom: '0px', padding: '0px', display:'flex', flexDirection:'column-reverse', justifyContent:'space-between' }} >
                    <Box display="flex" flexDirection="column" alignItems="center" mt={2} px={2} style={{border: '1px solid black'}}>
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
                    <Box display="flex" flexDirection="column-reverse" justifyContent="center" alignItems="center" style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', border: '1px solid black' }}>
                        <h1>conversation</h1>
                        <h1>conversation</h1>
                        <h1>conversation</h1>
                        <h1>conversation</h1>
                        <h1>conversation</h1>
                        <h1>conversation</h1>
                        <h1>conversation</h1>
                        <h1>conversation</h1>
                        <h1>conversation</h1>
                        <h1>conversation</h1>
                        <h1>conversation</h1>
                        <h1>conversation</h1>
                    </Box>
                </Paper>
            </Box>
    
            {/* Right Side: Study and Review Tasks */}
            <Box flexShrink={0} width={300} pr={2}>
                <Paper elevation={3} style={{ height: 'calc(100vh - 120px)', overflow: 'auto', marginTop: '0px', marginBottom: '0px' }} >
                    <Box>
                        <h1>This is study task</h1>
                        <h1>This is review item</h1>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}


export default ChatBuddy;