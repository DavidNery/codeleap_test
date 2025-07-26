import { AnimatePresence, motion } from "motion/react";
import { useContext } from "react";
import { UserContext } from "~/contexts/UserContext";
import type { Route } from "./+types/home";
import Main from "~/pages/main";
import Login from "~/pages/login";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "CodeLeap Engineering Test" },
    { name: "description", content: "David Nery test to frontend position at CodeLeap" },
  ];
}

export default function Home() {

  const userContext = useContext(UserContext);

  return (
    <AnimatePresence
      mode="wait"
    >
      <motion.div
        key={userContext?.loggedName ? 'logged' : 'notlogged'}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {
          userContext?.loggedName ? (
            <Main/>
          ) : (
            <Login />
          )
        }
      </motion.div>
    </AnimatePresence>
  );
}
