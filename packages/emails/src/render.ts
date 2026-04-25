import { render } from "@react-email/render";
import { WelcomeApproved } from "./templates/WelcomeApproved";
import { WaitlistReceived } from "./templates/WaitlistReceived";
import type { RenderedEmail } from "./index";

export type EmailProps =
  | { name: "welcome-approved"; props: { name: string; serial: string; paymentUrl: string } }
  | { name: "waitlist-received"; props: { name: string; serial: string; ticketUrl: string } };

export async function renderEmail(input: EmailProps): Promise<RenderedEmail> {
  switch (input.name) {
    case "welcome-approved": {
      const el = WelcomeApproved(input.props);
      const [html, text] = await Promise.all([
        render(el),
        render(el, { plainText: true }),
      ]);
      return {
        subject: `Société 입회 허가 · ${input.props.serial}`,
        html,
        text,
      };
    }
    case "waitlist-received": {
      const el = WaitlistReceived(input.props);
      const [html, text] = await Promise.all([
        render(el),
        render(el, { plainText: true }),
      ]);
      return {
        subject: "Société · 지원서 접수 확인",
        html,
        text,
      };
    }
  }
}
