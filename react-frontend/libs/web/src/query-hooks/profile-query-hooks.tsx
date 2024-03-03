import { APIPostData, APIUserProfile, CreateCommentRequest, CreatePostRequestData, CreatePostResponse, DeletePostRequest, FriendRequestData, LikePostRequest, SharePostRequest, mainApiClient } from "@facebook-clone/api_client/src";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";


export const queryKeys = {
  getHistoricUserPosts: (userID?: string) => ["get-historic-user-posts", userID ?? "undefined"], // todo: check if userID = undefined can be a problem
  post: (postID: string) => ["post", postID],
  me: ["get-me-query"],
  profile: (username: string) => ["get-profile-query", username],
} as const

export const useMeQuery = () => useQuery<APIUserProfile, AxiosError>(
  {
    queryKey: queryKeys.me,
    queryFn: () => {
      return mainApiClient.getMe()
    },
    retry(failureCount, error) {
      if (error.response?.status === 401) // do not retry if unothorized
        return false
      return true
    },
    refetchInterval: 5 * 60 * 1000
  }
)

export const useProfileByUsernameQuery = (username: string) => useQuery<APIUserProfile, AxiosError>(
  {
    queryKey: ["get-profile-query", username],
    queryFn: () => {
      return mainApiClient.getProfileByUsername(username)
    },
  }
)

export const useGetHistoricUserPostsQuery = (userID?: string) => {
  const queryClient = useQueryClient()

  return useInfiniteQuery<APIPostData[], AxiosError, string[], string[], number>(
    {
      queryKey: queryKeys.getHistoricUserPosts(userID),
      queryFn: async ({pageParam}) => {
        if (userID === undefined)
          throw new AxiosError("userID is undefined")

        const res = await mainApiClient.getHistoricUserPosts({userID, skip: pageParam})
        for (const post of res) {
          queryClient.setQueryData(queryKeys.post(post.id), () => post)
        }
        return res
      },
      select(data) {
        return data.pages.flatMap((page) => page.map((post) => post.id))
      },
      enabled: userID !== undefined,
      getNextPageParam: (lastPage, _, lastPageParam) => lastPage.length === 0 ? undefined : lastPageParam + lastPage.length,
      initialPageParam: 0,
    }
  )
}

export const useGetHomePageFeedQuery = () => {
  const queryClient = useQueryClient()

  return useInfiniteQuery<APIPostData[], AxiosError, string[], string[], number>(
    {
      queryKey: ["home-page-feed"],
      queryFn: async (data) => {
        const res = await mainApiClient.getHomePageFeed(data.pageParam)
        for (const post of res) {
          queryClient.setQueryData(queryKeys.post(post.id), () => post)
        }
        return res
      },
      select(data) {
        return data.pages.flatMap((page) => page.map((post) => post.id))
      },
      getNextPageParam: (lastPage, _, lastPageParam) => lastPage.length === 0 ? undefined : lastPageParam + lastPage.length,
      initialPageParam: 0,
    }
  )
}

export const useGetGroupsPageFeedQuery = () => {
  const queryClient = useQueryClient()

  return useInfiniteQuery<APIPostData[], AxiosError, string[], string[], number>(
    {
      queryKey: ["groups-page-feed"],
      queryFn: async ({pageParam}) => {
        const res = await mainApiClient.getGroupsPageFeed(pageParam)
        for (const post of res) {
          queryClient.setQueryData(queryKeys.post(post.id), () => post)
        }
        return res
      },
      select(data) {
        return data.pages.flatMap((page) => page.map((post) => post.id))
      },
      getNextPageParam: (lastPage, _, lastPageParam) => lastPage.length === 0 ? undefined : lastPageParam + lastPage.length,
      initialPageParam: 0,
    }
  )
}

export const useGetPostDataQuey = (postID: string) => {
  return useQuery<APIPostData, AxiosError>(
    {
      queryKey: queryKeys.post(postID),
      queryFn: () => {
        return mainApiClient.getPost({postID})
      },
      staleTime: 5 * 60 * 1000, // TODO: do it in queryClient config maybe
    }
  )
}

export const useCreatePostMutation = (userID: string) => {
  const queryClient = useQueryClient()

  return useMutation<CreatePostResponse, AxiosError, CreatePostRequestData>(
    {
      mutationKey: ["create-post", userID],
      mutationFn: (data) => {
        return mainApiClient.createPost(data)
      },
      onSuccess: (data, req) => {
        queryClient.invalidateQueries({queryKey: queryKeys.getHistoricUserPosts(userID)})
      }
    }
  )
}

export const useDeletePostMutation = (userID: string) => {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, DeletePostRequest>(
    {
      mutationKey: ["delete-post", userID],
      mutationFn: (data) => {
        return mainApiClient.deletePost(data)
      },
      onSuccess: (data, req) => {
        queryClient.invalidateQueries({queryKey: queryKeys.getHistoricUserPosts(userID)})
      }
    }
  )
}

export const useCreateCommentMutation = (postID: string) => {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, Pick<CreateCommentRequest, "text">>(
    {
      mutationKey: ["create-comment", postID],
      mutationFn: (data) => {
        return mainApiClient.createComment({postID, text: data.text})
      },
      onSuccess: (data, req) => {
        queryClient.invalidateQueries({queryKey: queryKeys.post(postID)})
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
        return mainApiClient.likePost(data)
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
        return mainApiClient.sharePost(data)
      },
      onSuccess: (data, req) => {
        queryClient.invalidateQueries({queryKey: queryKeys.post(req.postID)})
      }
    }
  )
}

export const useSendFriendRequestMutation = (username?: string) => {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, FriendRequestData>(
    {
      mutationKey: ["send-friend-request"],
      mutationFn: (data) => {
        return mainApiClient.sendFriendRequest(data)
      },
      onSuccess: (data, req) => {
        if (username) queryClient.invalidateQueries({queryKey: queryKeys.profile(username)})
      }
    }
  )
}

export const useAcceptFriendRequestMutation = (username?: string) => {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, FriendRequestData>(
    {
      mutationKey: ["accept-friend-request"],
      mutationFn: (data) => {
        return mainApiClient.acceptFriendRequest(data)
      },
      onSuccess: (data, req) => {
        if (username) queryClient.invalidateQueries({queryKey: queryKeys.profile(username)})
      }
    }
  )
}
