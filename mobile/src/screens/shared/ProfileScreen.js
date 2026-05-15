import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../auth/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import userApi from '../../api/userApi';
import { colors, type, radius, shadow, spacing } from '../../theme';

const ROLE_LABELS = {
  MEMBER: 'Community Member',
  WORKER: 'Maintenance Worker',
  FACILITY_MANAGER: 'Facility Manager',
  ADMIN: 'System Admin',
};

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  // Adding dummy state for phone, as it's in the design but not in current user schema
  const [phone, setPhone] = useState('+20 100 000 0000'); 
  const [saving, setSaving] = useState(false);

  const roleLabel = ROLE_LABELS[user?.role] || user?.role || 'User';
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        email: email.trim(),
      };
      const updated = await userApi.updateProfile(payload);
      await updateUser({ ...user, ...updated });
      Alert.alert('Success', 'Profile updated');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
        <Text style={styles.pageTitle}>My Account</Text>
        <Text style={styles.pageSubtitle}>Manage your personal details and session.</Text>
        </View>

        <View style={styles.card}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Text style={styles.sectionSubtitle}>Update your name and phone.</Text>

        <Input
          label="Full name"
          value={name}
          onChangeText={setName}
          placeholder="Your name"
        />
        
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Phone number"
          value={phone}
          onChangeText={setPhone}
          placeholder="+20 100 000 0000"
        />

        <Input
          label="Role"
          value={roleLabel}
          editable={false}
          style={styles.disabledInput}
        />

        <View style={styles.buttonRow}>
          <Button 
            title="Save changes" 
            onPress={handleSave} 
            loading={saving} 
            variant="action" 
            style={styles.saveButton}
          />
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <Feather name="log-out" size={16} color={colors.text} />
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  pageTitle: {
    fontSize: 32,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    ...type.bodyMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  sectionTitle: {
    ...type.heading,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...type.bodyMuted,
    marginBottom: spacing.xl,
  },
  
  disabledInput: {
    backgroundColor: colors.surfaceAlt,
    color: colors.textMuted,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
  },
  signOutText: {
    ...type.body,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});

export default ProfileScreen;
