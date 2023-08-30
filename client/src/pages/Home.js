import Container from '@mui/material/Container';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import student from './student.jpg';

function Home() {
    return (
        <Container>
            <CardMedia
                component="img"
                height="500"
                width="1000"
                image={student}
                alt="Website Introduction"
                sx={{ marginBottom: 2 }}
            />
            
            <Typography variant="h6" gutterBottom sx={{ fontStyle: 'italic' }}>
            Welcome to Langbuddy! A ChatGPT-powered English as a Foreign Language study platform with spaced repetition strategy.
            </Typography>


        </Container>
    )
}

export default Home;
