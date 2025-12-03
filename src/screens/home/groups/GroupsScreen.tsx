import React, { useEffect, useState } from "react";
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
  FlatList,
} from "react-native";
import { Colors } from "colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import firebase, { auth, db } from "configs/firebase";
import { User } from "types/User";
import { Group } from "types/Group";
import { useNavigation } from "@react-navigation/native";
import ProfileItem from "features/profiles/components/ProfileItem";
import ProfileModal from "features/profiles/components/ProfileModal";
import { useUser } from "context/UserContext";
import { generateDiscussionId, messagesService } from "services/messageService";
import GroupItem from "features/groups/components/GroupItem";

type SearchType = "all" | "name" | "email" | "phone" | "pseudo";

const GroupsScreen: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("all");
  const [showFilters, setShowFilters] = useState(false);
  const navigation = useNavigation();
  const { currentUser } = useUser();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedProfile, setSelectedProfile] = React.useState<User | null>(
    null
  );
  const [isModalVisible, setModalVisible] = React.useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      const userId = currentUser?.id;
      const groupsRef = db.ref("All_Groups");

      groupsRef.on("value", (snapshot) => {
        const data = snapshot.val();
        const userGroups: Group[] = [];

        if (data) {
          Object.keys(data).forEach((key) => {
            const group = data[key];
            if (group.memberIds && group.memberIds.includes(userId)) {
              userGroups.push(group);
            }
          });
        }

        setGroups(userGroups);
      });

      return () => groupsRef.off("value");
    };

    if (currentUser?.id) {
      fetchGroups();
    }
  }, [currentUser?.id]);

  const filteredGroups = groups.filter((group) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    switch (searchType) {
      case "name":
        return group.name.toLowerCase().includes(query);
      default:
        return group.name.toLowerCase().includes(query);
    }
  });

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case "name":
        return "Search by group name...";
      default:
        return "Search groups...";
    }
  };

  const getSearchIcon = () => {
    switch (searchType) {
      case "name":
        return "people-outline";
      default:
        return "search";
    }
  };



  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Groups</Text>

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
              autoCorrect={false}
              autoCapitalize="none"
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
            {(["all", "name"] as SearchType[]).map((type) => (
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
                  {type === "all" ? "All Fields" : "Group Name"}
                </Text>
                {searchType === type && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={Colors.primaryGreen}
                  />
                )}
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Groups List */}
      <View style={styles.groupsContainer}>
        <Text style={styles.groupsTitle}>Subscribed Groups</Text>
        <Text style={styles.resultsCount}>
          {filteredGroups.length} group
          {filteredGroups.length !== 1 ? "s" : ""} found
        </Text>
        <FlatList
          data={filteredGroups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <GroupItem group={item}  />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No groups found.</Text>
          }
          contentContainerStyle={styles.groupsList}
        />
      </View>

      {/* Floating Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("CreateGroupScreen" as never)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
    paddingHorizontal: 2,
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
  groupsContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  groupsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  groupItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  groupName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#25D366",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  groupsList: {
    paddingVertical: 10,
  },
});

export default GroupsScreen;
