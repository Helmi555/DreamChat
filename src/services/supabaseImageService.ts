import { supabase } from "configs/supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

export const uploadProfileImage = async (
  userId: string,
  imageUri: string,
  oldImageUrl?: string
): Promise<string> => {
  try {
    if (oldImageUrl) {
      console.info(
        "[Upload profile] Old image is ",
        oldImageUrl,
        "\nimageUri : ",
        imageUri
      );
      const urlParts = oldImageUrl.split("/profile-images/");
      if (urlParts.length > 1) {
        const oldFilePath = urlParts[1];
        await supabase.storage.from("profile-images").remove([oldFilePath]);
        console.log("Old image deleted:", oldFilePath);
      }
    }

    const fileName = `profile-${Date.now()}.jpg`;
    const filePath = `${userId}/${fileName}`;

    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const arrayBuffer = decode(base64);

    const { data, error } = await supabase.storage
      .from("profile-images")
      .upload(filePath, arrayBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      console.log("Supabase upload error:", error);
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-images").getPublicUrl(filePath);

    console.info("[Upload image]New public url ", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export const uploadDiscussionBackgroundImage = async (
  discussionId: string,
  imageUri: string,
  oldImageUrl?: string|null
): Promise<string> => {
  try {
    if (oldImageUrl) {
      const urlParts = oldImageUrl.split("/discussion-backgrounds/");
      if (urlParts.length > 1) {
        const oldFilePath = urlParts[1];
        await supabase.storage.from("discussion-backgrounds").remove([oldFilePath]);
      }
    }

    const fileName = `background-${Date.now()}.jpg`;
    const filePath = `${discussionId}/${fileName}`;

    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const arrayBuffer = decode(base64);

    const { error } = await supabase.storage
      .from("discussion-backgrounds")
      .upload(filePath, arrayBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("discussion-backgrounds")
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Upload discussion background error:", error);
    throw error;
  }
};