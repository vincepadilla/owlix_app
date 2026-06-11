import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { spacing, radius, typography, glassShadow } from '../theme/colors';

const FAQS = [
  {
    id: 'faq1',
    question: 'How do I upload a document?',
    answer: 'You can upload a document by navigating to the Documents tab and tapping the "Upload" button, or by using the Quick Action on the Dashboard.',
  },
  {
    id: 'faq2',
    question: 'How can I add a new job application?',
    answer: 'Tap on the "Jobs" tab and then press the "+" icon to manually add a new job application, or use the Quick Action on the Dashboard.',
  },
  {
    id: 'faq3',
    question: 'Can I edit an existing job application?',
    answer: 'Yes! Go to the Jobs tab, tap on the specific job application, and select "Edit" to update its status or details.',
  },
  {
    id: 'faq4',
    question: 'How do I change my profile picture?',
    answer: 'Head over to the Profile tab and tap on your current avatar. You can select a new image from your device gallery.',
  },
  {
    id: 'faq5',
    question: 'Is my data secure?',
    answer: 'Yes, your data is securely stored and protected using standard encryption protocols.',
  }
];

export default function ChatbotModal({ visible, onClose }) {
  const { theme, isDark } = useTheme();
  const [messages, setMessages] = useState([
    { id: 'msg0', sender: 'bot', text: 'Hi there! 👋 I am the Vault Assistant. How can I help you today?' },
  ]);
  const scrollViewRef = useRef();

  // State is preserved naturally since we don't reset it on visibility change

  const handleFaqClick = (faq) => {
    const userMsg = { id: `u_${Date.now()}`, sender: 'user', text: faq.question };
    setMessages(prev => [...prev, userMsg]);

    // Simulate slight delay for bot typing
    setTimeout(() => {
      const botMsg = { id: `b_${Date.now()}`, sender: 'bot', text: faq.answer };
      setMessages(prev => [...prev, botMsg]);
    }, 500);
  };

  const shadow = isDark ? glassShadow.dark : glassShadow.light;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.container, { backgroundColor: theme.bgCard, borderColor: theme.border }, shadow]}>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.botAvatar, { backgroundColor: `${theme.primary}22` }]}>
                <Ionicons name="chatbubbles" size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Chat Support</Text>
                <Text style={[styles.headerSubtitle, { color: theme.success }]}>Online</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: `${theme.danger}22` }]}>
              <Ionicons name="close" size={20} color={theme.danger} />
            </TouchableOpacity>
          </View>

          {/* Chat Area */}
          <ScrollView
            style={styles.chatArea}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <View key={msg.id} style={[styles.messageWrapper, isUser ? styles.messageUser : styles.messageBot]}>
                  <View style={[
                    styles.messageBubble,
                    isUser ? [styles.bubbleUser, { backgroundColor: theme.primary }] : [styles.bubbleBot, { backgroundColor: isDark ? '#333' : '#F3F4F6' }]
                  ]}>
                    <Text style={[
                      styles.messageText,
                      isUser ? { color: '#FFF' } : { color: theme.textPrimary }
                    ]}>
                      {msg.text}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* FAQ Chips */}
          <View style={[styles.faqSection, { borderTopColor: theme.border }]}>
            <Text style={[styles.faqTitle, { color: theme.textSecondary }]}>Suggested Questions:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
              {FAQS.map(faq => (
                <TouchableOpacity
                  key={faq.id}
                  style={[styles.faqChip, { borderColor: theme.primary, backgroundColor: `${theme.primary}11` }]}
                  onPress={() => handleFaqClick(faq)}
                >
                  <Text style={[styles.faqChipText, { color: theme.primary }]}>{faq.question}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 350,
    maxWidth: '90%',
    height: 500,
    maxHeight: '80%',
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.bodyBold,
    fontSize: 16,
  },
  headerSubtitle: {
    ...typography.caption,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatArea: {
    flex: 1,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  messageUser: {
    justifyContent: 'flex-end',
  },
  messageBot: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  faqSection: {
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  faqTitle: {
    ...typography.captionBold,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  faqChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  faqChipText: {
    ...typography.captionBold,
    fontSize: 13,
  },
});
