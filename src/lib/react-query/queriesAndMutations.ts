import {
 useQuery,
 useMutation,
 useQueryClient,
} from '@tanstack/react-query'
import { INewPost, INewUser, IUpdatePost } from '@/types'
import { createPost, createUserAccount, deletePost, deleteSavedPost, getCurrentUser, getPostById, getRecentPosts, getUserPosts, likePost, savePost, signInAccount, signOutAccount, updatePost } from '../appwrite/api'
import { QUERY_KEYS } from './queryKeys'

// user creation mutation
export const useCreateAccount = () =>{
    return useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user)
    })
}

// user signin mutation
export const useSignInAccount = () =>{
    return useMutation({
        mutationFn: (user: {
            email: string;
            password: string;
        }) =>signInAccount(user)
    })
}

// user signout mutation
export const useSignOutAccount = () =>{
    return useMutation({
        mutationFn: signOutAccount
    })
}

// property post creation mutation
export const useCreatePost = () =>{

    // querying all post to render in homepage
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (post: INewPost) => createPost(post),
        onSuccess: () =>{
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
        }
    })
}

// fetching property posts mutation
export const useGetRecentPosts = () =>{
    return useQuery({
        queryKey: [ QUERY_KEYS.GET_RECENT_POSTS],
        queryFn: getRecentPosts,
    })
}

// like post mutation
export const useLikePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({
        postId,
        likesArray,
      }: {
        postId: string;
        likesArray: string[];
      }) => likePost(postId, likesArray),
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POSTS],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        });
      },
    });
};

// save post mutation
export const useSavePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
        savePost(userId, postId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POSTS],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        });
      },
    });
};

// delete saved post mutation
export const useDeleteSavedPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POSTS],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        });
      },
    });
};

export const useGetCurrentUser = () => {
    return useQuery({
      queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      queryFn: getCurrentUser,
    });
};


// update post mutation
export const useUpdatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (post: IUpdatePost) => updatePost(post),
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
        });
      },
    });
};

// delete post mutation
export const useDeletePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ postId, imageId }: { postId?: string; imageId: string }) =>
        deletePost(postId, imageId),
        onSuccess: () => {
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        });
        },
    });
};

// edit created post mutation
export const useGetPostById = (postId?: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
        queryFn: () => getPostById(postId),
        enabled: !!postId,
    });
};

// get user post view
export const useGetUserPosts = (userId?: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
        queryFn: () => getUserPosts(userId),
        enabled: !!userId,
    });
};