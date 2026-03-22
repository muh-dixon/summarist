import Navbar from "@/components/home/Navbar";
import Landing from "@/components/home/Landing";
import Features from "@/components/home/Features";
import Statistics from "@/components/home/Statistics";
import Reviews from "@/components/home/Reviews";
import Numbers from "@/components/home/Numbers";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Landing />
      <Features />
      <Statistics />
      <Reviews />
      <Numbers />
      <Footer />
    </main>
  );
}
