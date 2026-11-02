export interface MailAddress {
  name: string;
  address: string;
}

export interface MailBody {
  contentType: 'html' | 'text';
  content: string;
}

export interface MailMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  body: MailBody;
  from: { emailAddress: MailAddress };
  receivedDateTime: string;
  isRead: boolean;
  /** UPN of the mailbox account */
  mailbox: string;
  /** Display name of the folder the message lives in */
  folderName: string;
  /** Conversation thread ID */
  conversationId: string;
}

export interface MailboxConfig {
  /** UPN / email address, e.g. "user@contoso.com". Empty string = signed-in user. */
  upn: string;
  displayName: string;
}
