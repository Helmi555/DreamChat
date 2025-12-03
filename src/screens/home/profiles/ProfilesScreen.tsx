import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { Colors } from "colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import firebase, { auth } from "configs/firebase";
import { User } from "types/User";
import { useNavigation } from "@react-navigation/native";
import ProfileItem from "features/profiles/components/ProfileItem";
import ProfileModal from "features/profiles/components/ProfileModal";
import { useUser } from "context/UserContext";
import { generateDiscussionId, messagesService } from "services/messageService";

type SearchType = "all" | "name" | "email" | "phone" | "pseudo";

const ProfilesScreen: React.FC = () => {
  const [profiles, setProfiles] = React.useState<User[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchType, setSearchType] = React.useState<SearchType>("all");
  const [showFilters, setShowFilters] = React.useState(false);
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const navigation = useNavigation();
  const { currentUser } = useUser();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!currentUser?.id) return;

    const profilesRef = firebase.database().ref("profiles");

    const listener = profilesRef.on("value", (snapshot) => {
      const data = snapshot.val();

      // Proper null/undefined check
      if (!data || typeof data !== "object") {
        console.log("No profiles data found or data is invalid");
        setProfiles([]);
        return;
      }

      try {
        // Convert object to array safely
        const profilesArray = Object.keys(data).map((key) => {
          const profile = data[key];
          return {
            id: key,
            ...profile,
          };
        }) as User[];

        // Filter out current user
        const filteredProfiles = profilesArray
          .filter((profile) => {
            // Additional safety check
            if (!profile || !profile.id) return false;
            return profile.id !== currentUser.id;
          })
          .sort((a, b) => {
            const emailA = a.email?.toLowerCase() || "";
            const emailB = b.email?.toLowerCase() || "";
            return emailA.localeCompare(emailB);
          });

        console.log(`Loaded ${filteredProfiles.length} profiles`);
        setProfiles(filteredProfiles);
      } catch (error) {
        console.error("Error processing profiles data:", error);
        setProfiles([]);
      }
    });

    return () => profilesRef.off("value", listener);
  }, [currentUser?.id]);

  const filteredProfiles = profiles.filter((profile) => {
    // Safety check for profile
    if (!profile) return false;

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
      case "phone":
        // Check if phoneNumber exists before calling includes
        return profile.phoneNumber
          ? profile.phoneNumber.includes(searchQuery)
          : false;
      case "pseudo":
        return (profile.pseudo?.toLowerCase() || "").includes(query);
      case "all":
      default:
        return (
          (profile.name?.toLowerCase() || "").includes(query) ||
          (profile.lastName?.toLowerCase() || "").includes(query) ||
          (profile.email?.toLowerCase() || "").includes(query) ||
          (profile.pseudo?.toLowerCase() || "").includes(query) ||
          (profile.phoneNumber
            ? profile.phoneNumber.includes(searchQuery)
            : false)
        );
    }
  });

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case "name":
        return "Search by name or last name...";
      case "email":
        return "Search by email...";
      case "phone":
        return "Search by phone number...";
      case "pseudo":
        return "Search by username...";
      default:
        return "Search by name, email, phone, or pseudo...";
    }
  };

  const getSearchIcon = () => {
    switch (searchType) {
      case "name":
        return "person-outline";
      case "email":
        return "mail-outline";
      case "phone":
        return "call-outline";
      case "pseudo":
        return "at-outline";
      default:
        return "search";
    }
  };

  const handlePress = (user: User) => {
    Keyboard.dismiss();
    // Direct navigation to conversation - SIMPLE FLOW
    if (!currentUser || !user) return;

    // Create discussion ID by sorting user IDs
    const discussionId = [currentUser.id, user.id].sort().join("_");

    // Navigate directly to conversation
    (navigation as any).navigate("ConversationScreen", {
      discussionId,
      secondUser: JSON.stringify(user),
    });
  };

  const handleProfileSelect = (user: User) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const [selectedProfile, setSelectedProfile] = React.useState<User | null>(
    null
  );
  const [isModalVisible, setModalVisible] = React.useState(false);

  const handleProfilePress = (profile: User) => {
    setSelectedProfile(profile);
    setModalVisible(true);
  };

  const handleStartChat =async (profile: User) => {
    setIsLoading(true);
    if (!currentUser || !profile) return;
    try {
     const discussionId =  await messagesService.createDiscussion(currentUser.id, profile.id);

      (navigation as any).navigate("ConversationScreen", {
        discussionId,
        secondUser: JSON.stringify(profile),
      });
    } catch (error) {
      console.error("Error starting chat:", error);
    }
    finally {
      setIsLoading(false);
      setModalVisible(false);    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Fixed Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Profiles</Text>

        {/* Search Bar with Filter Button */}
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
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              keyboardType={searchType === "phone" ? "phone-pad" : "default"}
              autoCorrect={searchType !== "phone"}
              autoCapitalize={searchType === "email" ? "none" : "words"}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={22} color={Colors.primaryGreen} />
          </TouchableOpacity>
        </View>

        {/* Active Filter Chip */}
        {searchType !== "all" && (
          <View style={styles.filterChip}>
            <Text style={styles.filterChipText}>
              Filter: {searchType.charAt(0).toUpperCase() + searchType.slice(1)}
            </Text>
            <TouchableOpacity onPress={() => setSearchType("all")}>
              <Ionicons name="close-circle" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilters(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
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
                  onPress={() => {
                    setSearchType(type);
                    setShowFilters(false);
                  }}
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

      {/* Profile Details Modal */}
      <ProfileModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        profile={selectedProfile!}
        onChatPress={() => handleStartChat(selectedProfile!)}
        isLoading={isLoading}
      />

      {/* Scrollable Content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 110 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filteredProfiles.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={60} color="#ccc" />
              <Text style={styles.emptyStateText}>
                {searchQuery
                  ? `No profiles found for "${searchQuery}" in ${searchType}`
                  : "No profiles available"}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.resultsCount}>
                {filteredProfiles.length} profile
                {filteredProfiles.length !== 1 ? "s" : ""} found
              </Text>
              {filteredProfiles.map((profile) => (
                <ProfileItem
                  key={profile.id}
                  user={profile}
                  onPress={() => handleProfilePress(profile)}
                  showIndicator
                />
              ))}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  headerContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.backgroundLight,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 15,
    textAlign: "center",
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
    marginRight: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    height: 40,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 10,
  },
  filterChipText: {
    color: Colors.primaryGreen,
    fontSize: 12,
    fontWeight: "600",
    marginRight: 6,
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
  scrollContainer: { flex: 1, width: "100%" },
  scrollContent: { paddingBottom: 20 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  resultsCount: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    paddingHorizontal: 16,
  },
  modalBody: {
    paddingBottom: 20,
  },
  profileDetailLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.textSecondary,
    marginTop: 10,
  },
  profileDetailValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
});

export default ProfilesScreen;
