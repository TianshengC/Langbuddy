import { Container, Paper, Typography } from "@mui/material";



function About() {
    return (
        <Container>
            <Paper elevation={3} style={{ padding: '24px' }}> 
                <Typography variant="h4" gutterBottom>
                    Product Feature
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Feature 1: Study Plan System
                </Typography>
                <Typography paragraph>
                    Well designed study materials and customized plan will help you learn English in a more efficient way.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Feature 2: Review System
                </Typography>
                <Typography paragraph>
                    Our spaced repetition algorithm will help you review your learning task at the right time.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Feature 3: ChatGPT-powered Chatbot with voice interaction
                </Typography>
                <Typography paragraph>
                    Our Chatbots provide individualized learning experiences and voice interaction, which will help you practice your English skills.
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ fontStyle: 'italic', textDecoration: 'underline' }}>
                    This website is for research and study purpose only.
                </Typography>
                
            </Paper>
        </Container>
    );
}

export default About;