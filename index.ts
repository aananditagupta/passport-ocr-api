// Import required modules
import express from 'express';
import fileUpload from 'express-fileupload';
import { ImageAnnotatorClient } from '@google-cloud/vision';

// Initialize Google Vision client
const client = new ImageAnnotatorClient();

// Initialize Express app
const app = express();

// Middleware to parse JSON requests and handle form uploads
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(fileUpload());
app.use(express.static('public')); 

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');  // Serve your index.html file
});

interface ITextAnnotation {
  description: string;
}

interface IExtractedDates {
  birthDate: string | null;
  expiryDate: string | null;
}

const extractDatesFromDetections = (detections: ITextAnnotation[]): IExtractedDates => {
  const text = detections.map(det => det.description).join(' ');
  const expiryRegex = /Date of Expiry\s*(\d{2}\/\d{2}\/\d{4})/;
  const birthRegex = /Date of Birth\s*(\d{2}\/\d{2}\/\d{4})/;

  const expiryMatch = text.match(expiryRegex);
  const birthMatch = text.match(birthRegex);

  const expiryDate = expiryMatch ? expiryMatch[1] : null;
  const birthDate = birthMatch ? birthMatch[1] : null;

  return { birthDate, expiryDate };
};



app.post('/upload', async (req, res) => {
  const image = (req.files?.image as any)?.data;  // Handling file uploads

  if (!image) {
      return res.status(400).send({ error: 'Image is required' });
  }

  try {
      // Perform OCR using Google Vision API
      const [result] = await client.textDetection(image);

      if (!result.textAnnotations || !Array.isArray(result.textAnnotations)) {
          throw new Error('No text annotations found');
      }

      const validAnnotations = result.textAnnotations.filter(annotation => typeof annotation.description === 'string');

      const detections: ITextAnnotation[] = validAnnotations.map(annotation => {
          return { description: annotation.description! }; // We've already filtered out invalid descriptions, so we can assert that this is a string
      });

      // Extract Date of Birth and Expiry Date from detections
      const { birthDate, expiryDate } = extractDatesFromDetections(detections);

      if (!birthDate || !expiryDate) {
          throw new Error('Failed to extract dates');
      }

      res.status(200).send({ birthDate, expiryDate });
  } catch (error) {
      res.status(500).send({ error: 'OCR failed', details: (error as Error).message });
  }
});


// Start server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
