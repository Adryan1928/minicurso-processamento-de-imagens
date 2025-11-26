import { queryClient } from "@/utils/QueryClient";
import { useMutation } from "@tanstack/react-query";
import { ImageUploadPayload, uploadImage } from "@/services/images";
import { toFormData } from "@/utils/form";
import { ImageData } from "@/services/images";


const QueryKeys = {
  all: ["images"] as const,
};

export const useUploadImage = () => useMutation({
    mutationKey: [QueryKeys.all, "upload"],
    mutationFn: (image: ImageData) => {

        const data = {
            image: image.image,
            areas: JSON.stringify(image.areas),
        } as ImageUploadPayload

        return uploadImage(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.all });
    },
  });


