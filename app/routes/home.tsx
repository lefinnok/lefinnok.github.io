import type { Route } from "./+types/home";
import { Chooser } from "~/components/Chooser";
import { pageMeta } from "~/lib/meta";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Lefinno Kwok | Engineering and craft",
    path: "/",
  });

export default function Home() {
  return <Chooser />;
}
