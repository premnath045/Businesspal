import { Models } from "appwrite";
import { useState, useEffect } from "react";

// import { useToast } from "@/components/ui/use-toast";
import Loader from '@/components/shared/Loader';
import PostCard from "@/components/shared/PostCard";
// import UserCard from '@/components/shared/UserCard';

import { useGetRecentPosts } from "@/lib/react-query/queriesAndMutations";


const Home = () => {

  const {
    data: posts,
    isPending: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();


  if (isErrorPosts) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
        <div className="home-creators">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">Property Listings</h2>
          {isPostLoading && !posts ? (
            <Loader />
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 w-full">
              {posts?.documents.map((post: Models.Document) => (
                <li key={post.$id} className="flex justify-center w-full">
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
