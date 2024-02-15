import { APIUserProfileResponse, mainAPI } from "@facebook-clone/api_client/main_api";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

// TODO: sensible config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
})

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
  },
  queryClient
)
