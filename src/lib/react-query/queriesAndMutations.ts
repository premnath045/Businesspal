import {
  useQuery,
  useMutation,
  useQueryClient,
 } from '@tanstack/react-query'
 import { INewPost, INewUser, IUpdatePost } from '@/types'
import { 
   createUserAccount, 
   signInAccount, 
   signOutAccount, 
   createPost, 
   getRecentPosts, 
   likePost, 
   savePost, 
   deleteSavedPost,   
   getCurrentUser, 
   updatePost, 
   deletePost, 
   getPostById, 
   getUserPosts 
 } from '@/lib/firebase/api'
  import { QUERY_KEYS } from './queryKeys'
 
 export const useCreateAccount = () => {
   return useMutation({
     mutationFn: (user: INewUser) => createUserAccount(user)
   })
 }
 
 export const useSignInAccount = () => {
   return useMutation({
     mutationFn: (user: {
       email: string;
       password: string;
     }) => signInAccount(user)
   })
 }
 
 export const useSignOutAccount = () => {
   return useMutation({
     mutationFn: signOutAccount
   })
 }
 
 export const useCreatePost = () => {
   const queryClient = useQueryClient()
 
   return useMutation({
     mutationFn: (post: INewPost) => createPost(post),
     onSuccess: () => {
       queryClient.invalidateQueries({
         queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
       })
     }
   })
 }
 
 export const useGetRecentPosts = () => {
   return useQuery({
     queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
     queryFn: getRecentPosts,
   })
 }
 
 export const useLikePost = () => {
   const queryClient = useQueryClient();
   return useMutation({
     mutationFn: ({
       postId,
       userId,
     }: {
       postId: string;
       userId: string;
     }) => likePost(postId, userId),
     onSuccess: () => {
       queryClient.invalidateQueries({
         queryKey: [QUERY_KEYS.GET_POST_BY_ID],
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
 
 export const useDeleteSavedPost = () => {
   const queryClient = useQueryClient();
   return useMutation({
     mutationFn: ({ userId, postId }: { userId: string; postId: string }) => 
       deleteSavedPost(userId, postId),
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
 
 export const useUpdatePost = () => {
   const queryClient = useQueryClient();
   return useMutation({
     mutationFn: (post: IUpdatePost) => updatePost(post),
     onSuccess: (data) => {
       queryClient.invalidateQueries({
         queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.id],
       });
     },
   });
 };
 
 export const useDeletePost = () => {
   const queryClient = useQueryClient();
   return useMutation({
     mutationFn: ({ postId, imageUrl }: { postId: string; imageUrl: string }) =>
       deletePost(postId, imageUrl),
     onSuccess: () => {
       queryClient.invalidateQueries({
         queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
       });
     },
   });
 };
 
 export const useGetPostById = (postId?: string) => {
   return useQuery({
     queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
     queryFn: () => getPostById(postId || ''),
     enabled: !!postId,
   });
 };
 
 export const useGetUserPosts = (userId?: string) => {
   return useQuery({
     queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
     queryFn: () => getUserPosts(userId || ''),
     enabled: !!userId,
   });
 };