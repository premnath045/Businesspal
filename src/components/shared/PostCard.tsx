import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { MapPin, Globe, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

interface FirebasePost {
  id: string;
  businessName: string;
  businessDomain: string;
  businessLocation: string;
  description: string;
  generatedAudit: string;
  progress: number;
}

interface PostCardProps {
  post: FirebasePost;
  onClick: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {

  const getProgressStatus = () => {
    if (post.progress === 100) return 'complete';
    if (post.progress === -1) return 'error';
    if (post.progress > 0) return 'in-progress';
    return 'not-started';
  };

  const progressStatus = getProgressStatus();

  return (
    <Card className="w-full cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/api/placeholder/32/32" alt="Business profile" />
            <AvatarFallback>{post.businessName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold">{post.businessName}</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
          View <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <Globe className="mr-2 h-4 w-4" />
            <span>{post.businessDomain}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{post.businessLocation}</span>
          </div>
        </div>
        {progressStatus !== 'not-started' && (
          <Progress 
            value={post.progress} 
            className="w-full" 
            indicatorColor={
              progressStatus === 'complete' ? 'bg-green-500' : 
              progressStatus === 'error' ? 'bg-red-500' : 
              'bg-blue-500'
            }
          />
        )}
      </CardContent>
      <CardFooter>
        <div className="flex justify-between items-center w-full text-sm font-medium">
          {progressStatus === 'not-started' && (
            <span className="text-gray-500">Not started</span>
          )}
          {progressStatus === 'in-progress' && (
            <>
              <span className="text-blue-500">Generating audit...</span>
              <span className="text-blue-500">{post.progress}%</span>
            </>
          )}
          {progressStatus === 'complete' && (
            <span className="text-green-500 flex items-center">
              <CheckCircle className="mr-1 h-4 w-4" /> Audit complete
            </span>
          )}
          {progressStatus === 'error' && (
            <span className="text-red-500 flex items-center">
              <AlertCircle className="mr-1 h-4 w-4" /> Error generating audit
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostCard;