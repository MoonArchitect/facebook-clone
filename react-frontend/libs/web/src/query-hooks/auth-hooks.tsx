import { SignInRequestData, SignUpRequestData, mainAPI } from "@facebook-clone/api_client/main_api";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { useSession } from "../components/utils/session-context";

// TODO: sensible config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
})

export const useSigninMutation = () => {
  // const router = useRouter()
  const {signin: sessionSignInCallback} = useSession()

  return useMutation<void, Error, SignInRequestData>(
    {
      mutationKey: ["singin"],
      mutationFn: mainAPI.signIn,
      onSuccess: () => {
        sessionSignInCallback()
        // router.push("/")
        // router.refresh()
        // window.location.replace("http://localhost:3000/")
        // window.location.reload()
      }
    },
    queryClient
  )
}

export const useSignoutMutation = () => {
  // const router = useRouter()
  // const t = useMeQuery()
  const {signout: sessionSignOutCallback} = useSession()

  return useMutation<void, Error, void>(
    {
      mutationKey: ["signout"],
      mutationFn: mainAPI.signOut,
      onSuccess: () => {
        sessionSignOutCallback()
        // t.refetch()
        // router.push("/")
        // router.refresh()
        // window.location.replace("http://localhost:3000/")
        // window.location.reload()
      }
    },
    queryClient
  )
}

export const useSignupMutation = () => useMutation<void, Error, SignUpRequestData>(
  {
    mutationKey: ["signup"],
    mutationFn: mainAPI.signUp,
  },
  queryClient
)
