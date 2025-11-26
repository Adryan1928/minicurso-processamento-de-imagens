import { toFormData } from "@/utils/form";
import request from "@/utils/request";

export type Media = {
  uri: string;
  name: string;
  type: string;
};

export interface UploadImageResponse {
  id: string;
  filename: string;
  url: string;
}

export interface AreaData {
  area_coordinates: { x: number; y: number }[];
  is_fill: boolean;
  intensity: number;
}

export interface ImageData {
  image: Media;
  areas: AreaData[];
}

export interface ImageUploadPayload {
  image: Media;
  areas: string;
}

export function uploadImage(image: ImageUploadPayload) {
  return request.postForm<UploadImageResponse>("/images/", toFormData(image));
}

export function getImageUrl(id: string) {
  return request.get<UploadImageResponse>(`/images/${id}`);
}