import { chatApiClient } from "@facebook-clone/api_client/src"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// TODO: combine all query keys into a single object
const queryKeys = {
  userChats: ["user-chats"]
}

export const useCreateChatMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: chatApiClient.create,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.userChats})
    }
  })
}

export const useListChatsQuery = () => {
  return useQuery({
    queryKey: queryKeys.userChats,
    queryFn: chatApiClient.list
  })
}