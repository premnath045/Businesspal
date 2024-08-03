import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, onSnapshot } from 'firebase/firestore';
import Loader from '@/components/shared/Loader';
import PostCard from "@/components/shared/PostCard";
import BusinessDetailsForm from "@/components/forms/NewAuditForm";
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { File, PlusCircle } from "lucide-react"
import AuditReport from '@/components/shared/AuditCard';

interface FirebasePost {
  id: string;
  businessName: string;
  businessDomain: string;
  businessLocation: string;
  description: string;
  generatedAudit: string | null;
  progress: number;
}

// audit report view section
const AuditContent: React.FC<{ post: FirebasePost; onBack: () => void }> = ({ post, onBack }) => (
  <div className="w-full">
    <button onClick={onBack} className="mb-4 flex items-center">
      <ArrowLeft className="mr-2" /> Back
    </button>
    <AuditReport post={post} />
  </div>
);


const Home: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<FirebasePost[]>([]);
  const [selectedPost, setSelectedPost] = useState<FirebasePost | null>(null);
  const [showNewAuditForm, setShowNewAuditForm] = useState(false);


  useEffect(() => {
    const db = getFirestore();
    const postsRef = collection(db, 'businessAudits');

    const unsubscribe = onSnapshot(postsRef, (snapshot) => {
      const fetchedData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirebasePost));

      setPosts(fetchedData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);




  const toggleNewAuditForm = () => {
    setShowNewAuditForm(!showNewAuditForm);
  };
  

  const handlePostClick = (post: FirebasePost) => {
    setSelectedPost(post);
  };

  const handleBackClick = () => {
    setSelectedPost(null);
  };

  if (loading) return <Loader />;


  return (
    <div className="flex flex-1">
      <div className="home-container">
        {!selectedPost && (
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={toggleNewAuditForm}>
              {showNewAuditForm ? (
                <>
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Back to Reports
                  </span>
                </>
              ) : (
                <>
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    New Audit
                  </span>
                </>
              )}
            </Button>
          </div>
        )}
        
        {selectedPost ? (
          <AuditContent post={selectedPost} onBack={handleBackClick} />
        ) : showNewAuditForm ? (
          <BusinessDetailsForm onSubmitSuccess={() => {
            toggleNewAuditForm();
            // Optionally, refresh the posts list here
          }} />
        ) : (
          <div className="home-posts">
            <h2 className="h3-bold md:h2-bold text-left w-full">Audit reports</h2>
            {posts.length === 0 ? (
              <p>No audit reports found.</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {posts.map((post) => (
                  <li key={post.id} className="flex justify-center w-full">
                    <PostCard post={post} onClick={() => handlePostClick(post)} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;