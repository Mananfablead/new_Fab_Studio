import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Home, ArrowLeft, Image as ImageIcon, Film } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Floating Photography Icons */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-[10%] top-[20%] hidden text-primary/20 md:block"
      >
        <Camera size={80} />
      </motion.div>

      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -15, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute right-[15%] top-[15%] hidden text-primary/15 md:block"
      >
        <ImageIcon size={60} />
      </motion.div>

      <motion.div
        animate={{
          x: [0, 15, 0],
          rotate: [0, 20, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute bottom-[20%] left-[15%] hidden text-primary/10 md:block"
      >
        <Film size={70} />
      </motion.div>

      {/* Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card/50 p-8 text-center shadow-2xl backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          className="mb-2"
        >
          <h1 className="bg-gradient-to-br from-primary to-primary/50 bg-clip-text text-9xl font-black tracking-tighter text-transparent">
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">
            Image Not Found
          </h2>
          <p className="mb-8 text-muted-foreground">
            The perspective you're looking for seems to be missing from our
            gallery. It might have been moved or doesn't exist.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-3 sm:flex-row sm:justify-center"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(-1)}
            className="group font-semibold"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Go Back
          </Button>
          <Button
            size="lg"
            onClick={() => navigate("/home")}
            className="bg-primary px-8 font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Button>
        </motion.div>

        {/* Subtle Lens Flare Effect */}
        <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-primary/20 blur-xl" />
      </motion.div>
    </div>
  );
};

export default NotFound;
