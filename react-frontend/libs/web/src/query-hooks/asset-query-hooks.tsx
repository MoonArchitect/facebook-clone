import { assetsAPI } from "@facebook-clone/api_client/main_api";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "../components/utils/session-context";


export const useUploadProfileCover = () => {
  const {refetchUserData} = useSession()

  return useMutation<void, Error, Blob>(
    {
      mutationKey: ["uploadProfileCover"],
      mutationFn: assetsAPI.uploadProfileCover,
      onSuccess: () => refetchUserData()
    },
  )
}

export const useUploadProfileThumbnail = () => {
  const {refetchUserData} = useSession()

  return useMutation<void, Error, Blob>(
    {
      mutationKey: ["uploadProfileCover"],
      mutationFn: assetsAPI.uploadProfileThumbnail,
      onSuccess: () => refetchUserData()
    },
  )
}
