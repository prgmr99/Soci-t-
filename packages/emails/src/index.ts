export type EmailName = "welcome-approved" | "waitlist-received";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export interface EmailAdapter {
  send(to: string, email: RenderedEmail): Promise<void>;
}

export { renderEmail } from "./render";
export type { EmailProps } from "./render";
export { WelcomeApproved } from "./templates/WelcomeApproved";
export type { WelcomeApprovedProps } from "./templates/WelcomeApproved";
export { WaitlistReceived } from "./templates/WaitlistReceived";
export type { WaitlistReceivedProps } from "./templates/WaitlistReceived";
