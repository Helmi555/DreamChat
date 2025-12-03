import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Colors } from "colors";

interface ChangeBackgroundModalProps {
  visible: boolean;
  onClose: () => void;
  onChangeBackground: () => void;
}

const ChangeBackgroundModal: React.FC<ChangeBackgroundModalProps> = ({
  visible,
  onClose,
  onChangeBackground,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Options</Text>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              onChangeBackground();
              onClose();
            }}
          >
            <Text style={styles.optionText}>Change Background Image</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
    width: "100%",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: Colors.textPrimary,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
    color: Colors.primaryGreen,
  },
});

export default ChangeBackgroundModal;
