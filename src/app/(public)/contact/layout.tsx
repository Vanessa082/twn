import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Write to Vanessa about collaborations, speaking, mentoring or a note that stayed with you.",
  path: routes.contact,
  eyebrow: "Contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
