import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  ToastAndroid,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Colors } from "colors";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "context/UserContext";
import { isPseudoAvailable, updateUserProfile } from "services/userService";
import ImagePickerModal from "features/settings/components/ImagePickerModal";
import { uploadProfileImage } from "services/supabaseImageService";

type RootStackParamList = {
  SettingsMain: undefined;
  EditProfile: undefined;
};

const EditProfileScreen: React.FC = () => {
  const { currentUser, setCurrentUser } = useUser();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [firstName, setFirstName] = useState(currentUser?.name || "");
  const [lastName, setLastName] = useState(currentUser?.lastName || "");
  const [pseudo, setPseudo] = useState(currentUser?.pseudo || "");
  const [phoneNumber, setPhoneNumber] = useState(
    currentUser?.phoneNumber || ""
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(
    currentUser?.profileImageUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Sorry, we need camera roll permissions to make this work!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Sorry, we need camera permissions to make this work!"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!currentUser?.id) {
      Alert.alert("Error", "No user ID found");
      return;
    }

    if (!(await isPseudoAvailable(pseudo, currentUser.id))) {
      Alert.alert("Error", `Pseudo '${pseudo}' is already taken`);
      return;
    }

    setIsUploading(true);

    try {
      let finalImageUrl = currentUser.profileImageUrl;

      if (profileImage && !profileImage.startsWith("http")) {
        finalImageUrl = await uploadProfileImage(
          currentUser.id,
          profileImage,
          currentUser.profileImageUrl
        );
      }

      await updateUserProfile(currentUser.id, {
        name: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        profileImageUrl: finalImageUrl || "",
        pseudo: pseudo,
      });

      setCurrentUser({
        ...currentUser,
        name: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        profileImageUrl: finalImageUrl || undefined,
        pseudo: pseudo,
      });

      setIsEditing(false);

      ToastAndroid.showWithGravity(
        "Profile updated successfully",
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
      navigation.goBack();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    navigation.goBack();
  };

  const handleTakePhoto = async () => {
    setIsImagePickerVisible(false);
    await takePhoto();
  };

  const handleChooseFromLibrary = async () => {
    setIsImagePickerVisible(false);
    await pickImage();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleCancel} activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.title}>Edit Profile</Text>

        {isEditing ? (
          <TouchableOpacity onPress={handleSave} activeOpacity={0.6}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            activeOpacity={0.6}
          >
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileImageContainer}>
          <TouchableOpacity
            onPress={
              isEditing ? () => setIsImagePickerVisible(true) : undefined
            }
            activeOpacity={isEditing ? 0.7 : 1}
          >
            <View style={styles.profileImage}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <Ionicons
                  name="person"
                  size={60}
                  color={Colors.textSecondary}
                />
              )}
            </View>
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setIsImagePickerVisible(false)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="camera"
                size={20}
                color={Colors.backgroundLight}
              />
            </TouchableOpacity>
          )}
        </View>
        <Text
          style={{
            alignSelf: "center",
            marginBottom: 10,
            fontSize: 14,
            fontWeight: "600",
            color: Colors.textThirdly,
          }}
        >
          {currentUser?.email}
        </Text>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* First Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={firstName}
              onChangeText={setFirstName}
              editable={isEditing}
              placeholder="Enter your first name"
              placeholderTextColor={Colors.textThirdly}
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={lastName}
              onChangeText={setLastName}
              editable={isEditing}
              placeholder="Enter your last name"
              placeholderTextColor={Colors.textThirdly}
            />
          </View>
          <View style={styles.inputContainer}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={styles.label}>Pseudo</Text>
              <Text
                style={{ fontSize: 12, color: Colors.errorRed, marginRight: 4 }}
              >
                Should be unique
              </Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={pseudo}
              onChangeText={setPseudo}
              editable={isEditing}
              placeholder="Enter your pseudo"
              placeholderTextColor={Colors.textThirdly}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              editable={isEditing}
              placeholder="Enter your phone number"
              placeholderTextColor={Colors.textThirdly}
              keyboardType="phone-pad"
            />
          </View>

          {/* Info Text */}
          {!isEditing && (
            <View style={styles.infoContainer}>
              <Ionicons
                name="information-circle"
                size={16}
                color={Colors.textSecondary}
              />
              <Text style={styles.infoText}>
                Tap Edit to modify your profile information
              </Text>
            </View>
          )}

          {/* Action Buttons when Editing */}
          {isEditing && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsEditing(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButtonFull]}
                onPress={handleSave}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <ImagePickerModal
          visible={isImagePickerVisible}
          onClose={() => setIsImagePickerVisible(false)}
          onTakePhoto={handleTakePhoto}
          onChooseFromLibrary={handleChooseFromLibrary}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dividerGray,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  editButton: {
    color: Colors.primaryGreen,
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    color: Colors.primaryGreen,
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
  },
  profileImageContainer: {
    alignItems: "center",
    paddingVertical: 24,
    position: "relative",
    borderWidth:0
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.backgroundGray,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: Colors.filterActiveBg,
    overflow: "hidden",
  },
  cameraButton: {
    position: "absolute",
    bottom: 30,
    right: "40%",
    backgroundColor: Colors.primaryGreen,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.backgroundLight,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.dividerGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  disabledInput: {
    backgroundColor: Colors.backgroundGray,
    color: Colors.textThirdly,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.filterActiveBg,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: Colors.backgroundGray,
    borderWidth: 1,
    borderColor: Colors.dividerGray,
  },
  saveButtonFull: {
    backgroundColor: Colors.primaryGreen,
  },
  cancelButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: Colors.backgroundLight,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EditProfileScreen;
