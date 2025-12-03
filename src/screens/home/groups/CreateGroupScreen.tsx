import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  ToastAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "colors";
import firebase from "configs/firebase";
import { User } from "types/User";
import ProfileItem from "features/profiles/components/ProfileItem";
import { useUser } from "context/UserContext";
import { useNavigation } from "@react-navigation/native";

type SearchType = "all" | "name" | "email" | "phone" | "pseudo";

const CreateGroupScreen = () => {
  const [groupName, setGroupName] = useState("");
  const [profiles, setProfiles] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const { currentUser } = useUser();
  const navigation = useNavigation();

  useEffect(() => {
    if (!currentUser?.id) return;

    const profilesRef = firebase.database().ref("profiles");

    const listener = profilesRef.on("value", (snapshot) => {
      const data = snapshot.val();

      if (!data || typeof data !== "object") {
        setProfiles([]);
        return;
      }

      const profilesArray = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      })) as User[];

      const filteredProfiles = profilesArray.filter(
        (profile) => profile.id !== currentUser.id
      );

      setProfiles(filteredProfiles);
    });

    return () => profilesRef.off("value", listener);
  }, [currentUser?.id]);

  const filteredProfiles = profiles.filter((profile) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    switch (searchType) {
      case "name":
        return (
          (profile.name?.toLowerCase() || "").includes(query) ||
          (profile.lastName?.toLowerCase() || "").includes(query)
        );
      case "email":
        return (profile.email?.toLowerCase() || "").includes(query);
      case "pseudo":
        return (profile.pseudo?.toLowerCase() || "").includes(query);
      default:
        return (
          (profile.name?.toLowerCase() || "").includes(query) ||
          (profile.lastName?.toLowerCase() || "").includes(query) ||
          (profile.email?.toLowerCase() || "").includes(query) ||
          (profile.pseudo?.toLowerCase() || "").includes(query)
        );
    }
  });

  const toggleUserSelection = (user: User) => {
    if (selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert("Validation Error", "Group name is required.");
      return;
    }

    if (selectedUsers.length === 0) {
      Alert.alert("Validation Error", "Please select at least one user.");
      return;
    }

    const groupId = firebase.database().ref("All_Groups").push().key;

    const newGroup = {
      id: groupId,
      name: groupName,
      memberIds: [currentUser?.id, ...selectedUsers.map((user) => user.id)],
    };

    firebase
      .database()
      .ref(`All_Groups/${groupId}`)
      .set(newGroup)
      .then(() => {
        ToastAndroid.show("Group created successfully!", ToastAndroid.SHORT);
        setGroupName("");
        setSelectedUsers([]);
        setSearchQuery("");
        navigation.goBack();

      })
      .catch((error) => {
        console.error("Error creating group:", error);
        Alert.alert("Error", "Failed to create group. Please try again.");
      });
  };

  const renderProfileItem = ({ item }: { item: User }) => (
    <ProfileItem
      user={item}
      onPress={() => toggleUserSelection(item)}
      showStatus={false} // Optional: Hide status if not needed
      variant="default" // Use the default variant
      isSelected={selectedUsers.some((u) => u.id === item.id)} // Pass isSelected prop
    />
  );

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case "name":
        return "Search by name or last name...";
      case "email":
        return "Search by email...";
      case "pseudo":
        return "Search by username...";
      default:
        return "Search by name, email, or pseudo...";
    }
  };

  const getSearchIcon = () => {
    switch (searchType) {
      case "name":
        return "person-outline";
      case "email":
        return "mail-outline";
      case "pseudo":
        return "at-outline";
      default:
        return "search";
    }
  };

  const handleFilterSelect = (type: string) => {
    setSearchType(type);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.mainContainer} edges={["top", "left", "right"]}>
      {/*header*/}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={navigation.goBack}
          activeOpacity={0.6}
          style={styles.headerLeft}
        >
          <Ionicons name="arrow-back" size={30} color={"#000"} />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.title}>Create Group</Text>
        </View>
      </View>

      <Text style={styles.label}>Group's Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter group name"
        value={groupName}
        onChangeText={setGroupName}
      />

      <View style={styles.searchRow}>
        <View style={styles.searchBarContainer}>
          <Ionicons
            name={getSearchIcon()}
            size={20}
            color={Colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={getSearchPlaceholder()}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="filter" size={22} color={Colors.primaryGreen} />
        </TouchableOpacity>
      </View>

      {searchType !== "all" && (
        <View style={styles.filterChip}>
          <Text style={styles.filterChipText}>
            Filter: {searchType.charAt(0).toUpperCase() + searchType.slice(1)}
          </Text>
          <TouchableOpacity onPress={() => setSearchType("all")}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Filters</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterLabel}>Search by:</Text>
            {(["all", "name", "email", "phone", "pseudo"] as SearchType[]).map(
              (type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    searchType === type && styles.filterOptionActive,
                  ]}
                  onPress={() => handleFilterSelect(type)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      searchType === type && styles.filterOptionTextActive,
                    ]}
                  >
                    {type === "all"
                      ? "All Fields"
                      : type === "name"
                      ? "Name & Last Name"
                      : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                  {searchType === type && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={Colors.primaryGreen}
                    />
                  )}
                </TouchableOpacity>
              )
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <FlatList
        data={filteredProfiles}
        keyExtractor={(item) => item.id}
        renderItem={renderProfileItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No users found.</Text>
        }
      />

      {selectedUsers.length > 0 && (
        <View style={styles.selectedUsersContainer}>
          <Text style={styles.selectedUsersCount}>
            Selected Users: {selectedUsers.length}
          </Text>
          <FlatList
            data={selectedUsers}
            showsHorizontalScrollIndicator={false}
            horizontal
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.selectedUserCapsule}>
                <Text style={styles.selectedUserText}>
                  {item.name || item.email}
                </Text>
                <TouchableOpacity
                  onPress={() => toggleUserSelection(item)}
                  style={styles.removeUserButton}
                >
                  <Ionicons
                    name="close"
                    size={16}
                    color="#fff"
                    onPress={() => toggleUserSelection(item)}
                  />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}

      <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
        <Text style={styles.createButtonText}>Create Group</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default CreateGroupScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: 12, // Correct padding property
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center the title
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderWidth: 0,
  },
  headerLeft: {
    position: "absolute", // Ensure the back button doesn't affect centering
    left: 8,
    width: 40,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 15,
    textAlign: "center",
  },
  label: {
    marginVertical: 8,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    height: 40,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
  createButton: {
    marginTop: 20,
    backgroundColor: Colors.primaryGreen,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  filterButton: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f7fa",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 10,
    width: "34%",
    justifyContent: "space-between",
  },
  filterChipText: {
    fontSize: 14,
    color: "#00796b",
    marginRight: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  filterLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    fontWeight: "600",
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#f8f8f8",
  },
  filterOptionActive: {
    backgroundColor: "#e8f5e9",
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  filterOptionTextActive: {
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  selectedUsersContainer: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  selectedUsersCount: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  selectedUserCapsule: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F4EA", // Soft green background for a subtle look
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#A8D5BA", // Muted green border for elegance
  },
  selectedUserText: {
    color: "#2E7D32", // Deep green text for readability
    fontSize: 14,
    marginRight: 8,
    fontWeight: "600", // Slightly bolder text for emphasis
  },
  removeUserButton: {
    backgroundColor: "#85bb87ff",
    borderRadius: 12,
    padding: 4,
  },
  profileItemContainer: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  selectedProfileItem: {
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
  },
  checkmarkContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 2,
  },
});
