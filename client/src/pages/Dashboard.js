import { Avatar, Box, Button, Container, Chip, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { set } from "react-hook-form";


function Dashboard() {
    const [loadingState, setLoadingState] = useState(true);
    const [overviewData, setOverviewItems] = useState({
        numOfScheduledStudyItemsToday: "",
        numOfScheduledStudyItemsTotal: "",
        numOfFinishedStudyItemsTotal: "",
        numOfScheduledReviewItemsToday: "",
        numOfScheduledReviewItemsTotal: "",
        numOfFinishedReviewItemsTotal: "",
        courseTitle: "",
        courseDescription: "",
        isRegistered: false,
    });




    // load all overview data
    useEffect(() => {

        const fetchOverviewData = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/dashboard`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include', // Ensures the request includes the cookie
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    setOverviewItems(data);
                } else {
                    throw new Error('Failed to fetch overview data');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingState(false);
            }
        };

        fetchOverviewData();
    }, [overviewData.isRegistered]);

    const handleRegister = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/dashboard/register-course`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Ensures the request includes the cookie
            });


            const data = await response.json();
            console.log(data);

            if (data.status) {
                
                setOverviewItems(prevState => ({
                    ...prevState,
                    isRegistered: true
                }));
            } else {
                throw new Error(data.message||'Failed to fetch course data');
            }
        } catch (err) {
            console.error(err);
        }
    }


    if (loadingState) {
        return null;
    }

    return (
        <Container>
            <Box pb={6}>
                <Paper elevation={3} sx={{ mt: 0, p: 3 }}>
                    {/* Title */}
                    <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
                        Study Overview
                    </Typography>

                    {/* Study Information Table */}
                    <Grid container justifyContent="center" style={{ height: '100%' }}>
                        <Grid item xs={12} md={8}>
                            <TableContainer component={Paper} variant="outlined" sx={{ my: 2 }}>
                                <Table aria-label="study overview table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell></TableCell>
                                            <TableCell align="center">Scheduled today</TableCell>
                                            <TableCell align="center">Scheduled total</TableCell>
                                            <TableCell align="center">Finished total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell component="th" scope="row">
                                                Number of study items
                                            </TableCell>

                                            <TableCell align="center">{overviewData.numOfScheduledStudyItemsToday}</TableCell>
                                            <TableCell align="center">{overviewData.numOfScheduledStudyItemsTotal}</TableCell>
                                            <TableCell align="center">{overviewData.numOfFinishedStudyItemsTotal}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row">
                                                Number of review items
                                            </TableCell>

                                            <TableCell align="center">{overviewData.numOfScheduledReviewItemsToday}</TableCell>
                                            <TableCell align="center">{overviewData.numOfScheduledReviewItemsTotal}</TableCell>
                                            <TableCell align="center">{overviewData.numOfFinishedReviewItemsTotal}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>

                    {/* Course Box */}
                    <Box mt={3}>

                        <Grid container spacing={3} alignItems="center" style={{ height: '100%' }}>
                            {/* Left Side: Title & Image */}

                            <Grid item xs={12} md={3} style={{ height: '100%' }}>
                                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" flexGrow={1}>
                                    <Typography variant="h6" gutterBottom>
                                        Course
                                    </Typography>
                                    <Typography variant="h6" gutterBottom>
                                        Recommended
                                    </Typography>
                                    <Avatar alt="Sample Image" src="/path-to-your-image.jpg" variant="rounded" sx={{ width: 128, height: 128 }} />
                                </Box>
                            </Grid>
                            {/* Right Side: Text & Button */}
                            <Grid item xs={12} md={9} style={{ height: '100%' }}>
                                <Box display="flex" flexDirection="column" justifyContent="space-between" alignItems="flex-start" flexGrow={1} style={{ height: '100%' }}>
                                    {/* Description about the image */}
                                    <Typography variant="h6" mb={0} pr={5}>
                                        {overviewData.courseTitle}
                                    </Typography>
                                    <Typography variant="body1" mb={2} pr={5}>
                                        {overviewData.courseDescription}
                                    </Typography>
                                    {/* Registration Button */}
                                    {overviewData.isRegistered ?
                                        (<Chip label="Registered Successfully" color="success" />) :
                                        (<Button variant="contained" color="primary" onClick={handleRegister}>
                                            Register
                                        </Button>)}
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}

export default Dashboard;