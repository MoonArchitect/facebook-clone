import { UploadPostImageRequest, assetsApiClient } from "@facebook-clone/api_client/assets_api";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "../components/utils/session-context";


export const useUploadProfileCover = () => {
  const {refetchUserData} = useSession()

  return useMutation<void, Error, Blob>(
    {
      mutationKey: ["uploadProfileCover"],
      mutationFn: assetsApiClient.uploadProfileCover,
      onSuccess: () => refetchUserData()
    },
  )
}

export const useUploadProfileThumbnail = () => {
  const {refetchUserData} = useSession()

  return useMutation<void, Error, Blob>(
    {
      mutationKey: ["uploadProfileThumbnail"],
      mutationFn: assetsApiClient.uploadProfileThumbnail,
      onSuccess: () => refetchUserData()
    },
  )
}

export const useUploadPostImage = () => {
  return useMutation<void, Error, UploadPostImageRequest>(
    {
      mutationKey: ["uploadPostImage"],
      mutationFn: assetsApiClient.uploadPostImage,
    },
  )
}
