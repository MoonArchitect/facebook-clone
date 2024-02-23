import { SignInRequestData, SignUpRequestData, mainAPI } from "@facebook-clone/api_client/main_api";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "../components/utils/session-context";

export const useSigninMutation = () => {
  const {signin: sessionSignInCallback} = useSession()

  return useMutation<void, Error, SignInRequestData>(
    {
      mutationKey: ["singin"],
      mutationFn: mainAPI.signIn,
      onSuccess: () => {
        sessionSignInCallback()
      }
    },
  )
}

export const useSignoutMutation = () => {
  const {signout: sessionSignOutCallback} = useSession()

  return useMutation<void, Error, void>(
    {
      mutationKey: ["signout"],
      mutationFn: mainAPI.signOut,
      onSuccess: () => {
        sessionSignOutCallback()
        // TODO: clear server options and local storage on logout
      }
    },
  )
}

export const useSignupMutation = () => {
  const {signin: sessionSignInCallback} = useSession()

  return useMutation<void, Error, SignUpRequestData>(
    {
      mutationKey: ["signup"],
      mutationFn: mainAPI.signUp,
      onSuccess: () => {
        sessionSignInCallback()
      }
    },
  )
}
