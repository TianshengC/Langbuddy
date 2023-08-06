import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TranslateIcon from '@mui/icons-material/Translate';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import { cyan } from '@mui/material/colors';


function Chatbox({message}){
    const { user, text } = message;

    const chatboxStyle = {
        alignSelf: user === 'user' ? 'flex-end' : 'flex-start',
        backgroundColor: user === 'user' ? cyan[600] : '#eee',
        color: user === 'user' ? 'white' : 'black',
        marginBottom: '10px',
        marginLeft: user === 'user' ? '150px' : '0px',
        marginRight: user === 'user' ? '0px' : '150px',
        width: 'auto',
        borderRadius: user === 'user' ? '20px 5px 20px 20px' : '5px 20px 20px 20px'
    };

    const iconColor = user === 'user' ? 'white' : 'action';

    return (
        <section style={{width:'100%', padding:'0px 10px'}}>
        <Card variant="outlined" p={0} style={chatboxStyle}>
            <CardContent pt={0} pb={0} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding:'10px 10px 3px 10px' }}>
            <Box mt={0} mb={0}>
                <Typography variant="body1" >
                    {text}
                </Typography>
            </Box>
                <Box display="flex" mt={0} mb={0} justifyContent={user === 'user' ? 'flex-end' : 'flex-start'} alignItems='center' style={{width:'100%'}}>
                    <IconButton aria-label="translate">
                        <TranslateIcon style={{ fontSize: 17, color: iconColor }}/>
                    </IconButton>
                    <IconButton aria-label="speak">
                        <VolumeUpIcon style={{ fontSize: 17, color: iconColor }}/>
                    </IconButton>
                    <IconButton aria-label="add">
                        <AddIcon style={{ fontSize: 17, color: iconColor }}/>
                    </IconButton>
                </Box>
            </CardContent>
        </Card>
        </section>
    )
}

export default Chatbox;