import { APIUserProfileResponse, mainAPI } from "@facebook-clone/api_client/main_api";
import { useQuery } from "@tanstack/react-query";
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
