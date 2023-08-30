import { Container, Paper, Typography } from "@mui/material";

function ContactUs() {
    return (
        <Container>
            <Paper elevation={3} style={{ padding: '24px' }}> 
                <Typography variant="h4" gutterBottom>
                    Contact Us
                </Typography>

                <Typography variant="h6" gutterBottom>
                    For any enquiries:
                </Typography>
                <Typography paragraph>
                    2807300c@student.gla.ac.uk
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ fontStyle: 'italic', textDecoration: 'underline' }}>
                    This website is for research and study purpose only.
                </Typography>
                
            </Paper>
        </Container>
    );
}

export default ContactUs;