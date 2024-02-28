import { APIPostData, APIUserProfileResponse, CreatePostRequestData, LikePostRequest, SharePostRequest, mainAPI } from "@facebook-clone/api_client/main_api";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  getHistoricUserPosts: (userID?: string) => ["get-historic-user-posts", userID ?? "undefined"], // todo: check if userID = undefined can be a problem
  post: (postID: string) => ["post", postID],
} as const


export const useGetHistoricUserPostsQuery = (userID?: string) => {
  const queryClient = useQueryClient()

  return useInfiniteQuery<APIPostData[], AxiosError, string[], string[], number>(
    {
      queryKey: queryKeys.getHistoricUserPosts(userID),
      queryFn: ({pageParam}) => {
        if (userID === undefined)
          throw new AxiosError("userID is undefined")

        return mainAPI.getHistoricUserPosts({userID, skip: pageParam})
      },
      select(data) {
        for (const page of data.pages) {
          for (const post of page) {
            queryClient.setQueryData(queryKeys.post(post.id), () => post)
          }
        }
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
      queryFn: (data) => {
        return mainAPI.getHomePageFeed(data.pageParam)
      },
      select(data) {
        for (const page of data.pages) {
          for (const post of page) {
            queryClient.setQueryData(queryKeys.post(post.id), () => post)
          }
        }
        // return {
        //   pages: data.pages.map((page) => page.map((post) => post.id)),
        //   pageParams: data.pageParams
        // }
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
      queryFn: ({pageParam}) => {
        return mainAPI.getGroupsPageFeed(pageParam)
      },
      select(data) {
        for (const page of data.pages) {
          for (const post of page) {
            queryClient.setQueryData(queryKeys.post(post.id), () => post)
          }
        }
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