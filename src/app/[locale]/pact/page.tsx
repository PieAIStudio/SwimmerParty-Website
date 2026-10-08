import { permanentRedirect } from "next/navigation";
export default function PactRedirect() {
  permanentRedirect("/license#promises");
}
