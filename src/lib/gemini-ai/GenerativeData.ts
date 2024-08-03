// GenerativeData.ts file
import { getFirestore, updateDoc, doc } from 'firebase/firestore';
import { generateContent } from './config';

const GenerativeData = async (docId: string, formData: any) => {
  const db = getFirestore();
  const docRef = doc(db, 'businessAudits', docId);

  try {
    // Initialize progress
    await updateDoc(docRef, { progress: 0 });

    // Create a progress callback function
    const progressCallback = async (progress: number) => {
      await updateDoc(docRef, { progress: Math.round(progress * 100) });
    };

    // Generate the content with progress updates
    const generatedContent = await generateContent(
      formData.businessName,
      formData.businessDomain,
      formData.businessLocation,
      formData.description,
      progressCallback
    );

    // Update the document with the generated content and set progress to 100%
    await updateDoc(docRef, {
      generatedAudit: generatedContent,
      progress: 100
    });

  } catch (error: any) {
    console.error("Error generating content: ", error);
    await updateDoc(docRef, { 
      progress: -1,
      error: error.message || "An unexpected error occurred"
    }); // Indicate error state
  }
};

export default GenerativeData;