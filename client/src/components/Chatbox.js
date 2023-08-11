import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TranslateIcon from '@mui/icons-material/Translate';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import Box from '@mui/material/Box';
import { cyan } from '@mui/material/colors';
import RateReviewIcon from '@mui/icons-material/RateReview';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useState } from 'react';
import {  useForm } from 'react-hook-form';
import { Divider, FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import categories from '../utils/categories';
import NewlineText from './NewLineText';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';


function Chatbox({ message, setSnackbarOpen, setSnackbarMessage, setSnackbarSeverity, setTodayReviewItems }) {
    const { role, content } = message;
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
    const [selectedPattern, setSelectedPattern] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [translatedText, setTranslatedText] = useState('');
    const [showTranslatedText, setShowTranslatedText] = useState(false);
    const [loadingTranslation, setLoadingTranslation] = useState(false);
    const [loadingSpeech, setLoadingSpeech] = useState(false);

    const handleModalOpen = () => {
        setValue('content', content);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        reset();  // Reset form state upon modal close
    };

//handle translation function
    const handleTranslate = async () => {
        
        if (showTranslatedText) {
            setShowTranslatedText(false);
            return;
        }

        try {
            setLoadingTranslation(true);
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Ensures the request includes the cookie
                body: JSON.stringify({ content:content })
            });
            
            const result = await response.json();
            if(response.ok){

                setTranslatedText(result.translatedText);
                setShowTranslatedText(true);

                setSnackbarOpen(true);
                setSnackbarMessage('Tranlated successfully');
                setSnackbarSeverity('success');
            } else {
                throw new Error(result.message || "Translation failed");
            }  

        } catch (err) {
            console.error(err.message);
            setSnackbarOpen(true);
            setSnackbarMessage(err.message || 'Translation failed');
            setSnackbarSeverity('error');
        }finally {
            setLoadingTranslation(false);
        }

    };

// //handle speech synthesis by Web API, future reference
//     const handleSpeak = async () => {
//         if ('speechSynthesis' in window) {
//             let utterance = new SpeechSynthesisUtterance(content);
//             utterance.lang = 'en-US'; 
//             speechSynthesis.speak(utterance);
//         } else {
//             console.error("Your browser doesn't support text-to-speech.");
//             setSnackbarMessage('Your browser doesn\'t support text-to-speech.');
//             setSnackbarSeverity('error');
//         }
//     }

//handle speech synthesis Microsoft Azure API
    const handleSpeak = async () => {
        try {

            setLoadingSpeech(true);
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/synthesis`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text: content })
            });
    
            if (response.ok) {
                const audioBlob = await response.blob();
                const audioUrl = window.URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                audio.play();
                audio.onended = () => {
                    window.URL.revokeObjectURL(audioUrl); // Free up memory
                };
                setSnackbarOpen(true);
                setSnackbarMessage('Speech synthesized successfully');
                setSnackbarSeverity('success');
            } else {
                console.error("Failed to synthesize speech.");
                setSnackbarOpen(true);
                setSnackbarMessage('Failed to synthesize speech.');
                setSnackbarSeverity('error');
            }
        } catch (error) {
            console.error("There was an error with the text-to-speech request:", error);
        } finally {
            setLoadingSpeech(false);
        }
    };



//create a review item and relevant sessions
    const onSubmit = async data => {

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Ensures the request includes the cookie
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                const isAnySessionTodayOrBefore = result.reviewSessions.some(session => {
                    const today = new Date();
                    const sessionDate = new Date(session.scheduled_date);

                    // Resetting hours, minutes, seconds and milliseconds for accurate comparison
                    today.setHours(0, 0, 0, 0);
                    sessionDate.setHours(0, 0, 0, 0);

                    return sessionDate <= today;
                });
                console.log(result);
                console.log(isAnySessionTodayOrBefore);


                if (isAnySessionTodayOrBefore) {
                    setTodayReviewItems(prevDisplayedReviewItems => [...prevDisplayedReviewItems, result]);
                }
                setSnackbarMessage('Review item created successfully');
                setSnackbarSeverity('success');
            } else {
                const error = await response.text();
                throw new Error(error);
            }
        } catch (err) {
            console.error(err.message);
            setSnackbarMessage('Error creating review item');
            setSnackbarSeverity('error');
        }

        setSnackbarOpen(true);
        reset();
        handleModalClose();
    };

    const chatboxStyle = {
        alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
        backgroundColor: role === 'user' ? cyan[600] : '#eee',
        color: role === 'user' ? 'white' : 'black',
        marginBottom: '10px',
        marginLeft: role === 'user' ? '150px' : '0px',
        marginRight: role === 'user' ? '0px' : '150px',
        width: 'auto',
        borderRadius: role === 'user' ? '20px 5px 20px 20px' : '5px 20px 20px 20px'
    };

    const iconColor = role === 'user' ? 'white' : 'inherit';

    if (role === 'topic') {
        return (
          <section style={{ width: '100%', padding: '5px 20px', marginBottom:"5px", marginTop:"20px" }}>
            <Divider variant="middle" >
            <Chip label={"Topic: " + content} />
          </Divider>
        </section>
        )}
    

    return (
        <section style={{ width: '100%', padding: '0px 10px' }}>
            <Card variant="outlined" p={0} style={chatboxStyle}>
                <CardContent pt={0} pb={0} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '10px 10px 3px 10px' }}>
                    <Box mt={0} mb={0}>
                        <Typography variant="body1" >
                            <NewlineText text={content}/>
                        </Typography>
                        {showTranslatedText && (<Divider />)}
                            {showTranslatedText &&(
                            <Typography variant="body1" >
                                {translatedText}
                            </Typography>)}
                    </Box>
                    <Box display="flex" mt={0} mb={0} justifyContent={role === 'user' ? 'flex-end' : 'flex-start'} alignItems='center' style={{ width: '100%' }}>
                        <Tooltip title="translation">
                            <IconButton aria-label="translate" onClick={handleTranslate}>
                                {loadingTranslation? <CircularProgress size={15} style={{color:iconColor }}/>:<TranslateIcon style={{ fontSize: 12, color: iconColor }} />}
                                
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="audio">
                            <IconButton aria-label="speak" onClick={handleSpeak}>
                            {loadingSpeech? <CircularProgress size={15} style={{color:iconColor }}/>:<VolumeUpIcon style={{ fontSize: 17, color: iconColor }} />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="create review">
                            <IconButton aria-label="add" onClick={handleModalOpen}>
                                <RateReviewIcon style={{ fontSize: 17, color: iconColor }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </CardContent>
            </Card>

            {/* // Add a Review item Dialog */}
            <Dialog open={modalOpen} onClose={handleModalClose}>
                <DialogTitle style={{ textAlign: 'center', paddingBottom: '0px' }}>Add Review Item</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        <TextField
                            margin="normal"
                            label="Title"
                            type="text"
                            fullWidth
                            style={{ marginTop: 0 }}
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
                            <FormHelperText sx={{ color: '#d32f2f' }}>{errors.category?.message}</FormHelperText>
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
                        <FormControl fullWidth margin="dense">
                            <InputLabel id="review-pattern-label">Review Pattern</InputLabel>
                            <Select
                                labelId="review-pattern-label"
                                {...register('review_pattern', { required: "Review Pattern is required" })}
                                error={!!errors.review_pattern}
                                label="Review Pattern"
                                onChange={(e) => setSelectedPattern(e.target.value)}
                            >
                                <MenuItem value="Simple">Default - Simple (1st, 3rd, 7th days)</MenuItem>
                                <MenuItem value="Normal">Default - Normal (1st, 2nd, 4th, 7th, 14th days)</MenuItem>
                                <MenuItem value="Custom">Custom</MenuItem>
                            </Select>
                            {errors.review_pattern && <p>{errors.review_pattern.message}</p>}
                        </FormControl>
                        {selectedPattern === 'Custom' && (
                            <TextField
                                margin="dense"
                                label="First Review Date"
                                type="date"
                                fullWidth
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                {...register('firstReviewDate', {
                                    required: "First Review Date is required",
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
                                error={!!errors.firstReviewDate}
                                helperText={errors.firstReviewDate?.message}
                            />
                        )}
                        {selectedPattern === 'Custom' && (<Typography variant="body2" gutterBottom align="left">
                            You can add more review sessions later.
                        </Typography>)}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleModalClose}>Cancel</Button>
                        <Button type="submit">Submit</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </section>
    )
}

export default Chatbox;