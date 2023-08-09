import { Avatar, Box, Button, Container, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";


function Dashboard() {

    return (
        <Container>
            <Box pb={8}>
                <Paper elevation={3} sx={{ mt: 0, p: 3 }}>
                    {/* Title */}
                    <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
                        Study Overview
                    </Typography>

                    {/* Study Information Table */}
                    <Grid container justifyContent="center">
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

                                            <TableCell align="center">Data</TableCell>
                                            <TableCell align="center">Data</TableCell>
                                            <TableCell align="center">Data</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row">
                                                Number of review items
                                            </TableCell>

                                            <TableCell align="center">Data</TableCell>
                                            <TableCell align="center">Data</TableCell>
                                            <TableCell align="center">Data</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>

                    {/* Course Box */}
                    <Box mt={3}>

                        <Grid container spacing={3} alignItems="center">
                            {/* Left Side: Title & Image */}

                            <Grid item xs={12} md={3}>
                                <Box display="flex" flexDirection="column" alignItems="center">
                                    <Typography variant="h6" gutterBottom>
                                        Course Introduction
                                    </Typography>
                                    <Avatar alt="Sample Image" src="/path-to-your-image.jpg" variant="rounded" sx={{ width: 128, height: 128 }} />
                                </Box>
                            </Grid>
                            {/* Right Side: Text & Button */}
                            <Grid item xs={12} md={9}>
                                <Box display="flex" flexDirection="column" justifyContent="space-between" alignItems="flex-start">
                                    {/* Description about the image */}
                                    <Typography variant="body1" mb={2}>
                                        Well structured English learning course.
                                    </Typography>
                                    {/* Registration Button */}
                                    <Button variant="contained" color="primary">
                                        Register
                                    </Button>
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