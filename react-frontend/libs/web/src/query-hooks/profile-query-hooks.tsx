import { APIPostData, APIUserProfileResponse, CreatePostRequestData, LikePostRequest, SharePostRequest, mainAPI } from "@facebook-clone/api_client/main_api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const useMeQuery = () => useQuery<APIUserProfileResponse, AxiosError>(
  {
    queryKey: ["get-me-query"],
    queryFn: () => {
      return mainAPI.getMe()
    },
    retry(failureCount, error) {
      if (error.response?.status === 401) // do not retry if unothorized
        return false
      return true
    },
    refetchInterval: 5 * 60 * 1000
  }
)

export const queryKeys = {
  getHistoricUserPosts: (userID: string) => ["get-historic-user-posts", userID],
  post: (postID: string) => ["post", postID],
} as const


export const useGetHistoricUserPostsQuery = (userID: string) => {
  const queryClient = useQueryClient()

  return useQuery<APIPostData[], AxiosError, string[]>(
    {
      queryKey: queryKeys.getHistoricUserPosts(userID),
      queryFn: () => {
        return mainAPI.getHistoricUserPosts({userID})
      },
      select(data) {
        for (const post of data) {
          queryClient.setQueryData(queryKeys.post(post.id), () => post)
        }
        return data.map((post) => post.id)
      },
    }
  )
}

export const useGetPostDataQuey = (postID: string) => {
  return useQuery<APIPostData, AxiosError>(
    {
      queryKey: queryKeys.post(postID),
      queryFn: () => {
        return mainAPI.getPost({postID})
      },
      staleTime: 5 * 60 * 1000, // TODO: do it in queryClient config maybe
    }
  )
}

export const useCreatePostMutation = (userID: string) => {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, CreatePostRequestData>(
    {
      mutationKey: ["create-post"],
      mutationFn: (data) => {
        return mainAPI.createPost(data)
      },
      onSuccess: (data, req) => {
        queryClient.invalidateQueries({queryKey: queryKeys.getHistoricUserPosts(userID)})
      }
    }
  )
}

export const useLikePostMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, LikePostRequest>(
    {
      // mutationKey: ["like-post"],
      mutationFn: (data) => {
        return mainAPI.likePost(data)
      },
      onSuccess: (data, req) => {
        queryClient.invalidateQueries({queryKey: queryKeys.post(req.postID)})
      }
    }
  )
}

export const useSharePostMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, SharePostRequest>(
    {
      // mutationKey: ["like-post"],
      mutationFn: (data) => {
        return mainAPI.sharePost(data)
      },
      onSuccess: (data, req) => {
        queryClient.invalidateQueries({queryKey: queryKeys.post(req.postID)})
      }
    }
  )
}