import axios, { AxiosInstance } from 'axios'

export type UploadPostImageRequest = {
  id: string
  img: Blob
}

const assetsAPIAxiosClient = axios.create({
  baseURL: 'http://localhost:8080/asset_api/v1',
  timeout: 5000,
  withCredentials: true
})

const createAssetsAPIClient = (client: AxiosInstance) => {
  return {
    uploadProfileCover: async (data: Blob) => {
      await client.post("/profile/cover", data, {headers: {"Content-Type": data.type}})
    },
    uploadProfileThumbnail: async (data: Blob) => {
      await client.post("/profile/thumbnail", data, {headers: {"Content-Type": data.type}})
    },
    uploadPostImage: async (data: UploadPostImageRequest) => {
      await client.post(`/post/images/${data.id}`, data.img, {headers: {"Content-Type": data.img.type}})
    },
  }
}

export const assetsApiClient = createAssetsAPIClient(assetsAPIAxiosClient)
