"use client"

import { motion } from "framer-motion";
import Navbar from "./_components/Navbar.jsx"
import Footer from "./_components/Footer.jsx"
export default function Home() {
  return (
    <div className="w-full ">
      <Navbar/>

      {/* HERO SECTION WITH FIXED BACKGROUND */}
      <section
        className="h-screen flex items-center justify-center bg-fixed bg-center bg-cover"
        style={{
          backgroundImage:
            "url('/bg.jpeg')",
        }}
      >
        <div className="bg-black/60 w-full h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center px-4"
          >
            <h1 className="text-white text-4xl md:text-6xl font-bold mb-4">
              ANIKET LOGISTIC 
            </h1>
            <p className="text-gray-200 text-lg md:text-xl mb-6">
              Reliable Transportation Services for Tata Motors & Affiliated Organizations
            </p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-red-600 text-white px-6 py-3 rounded-2xl shadow-lg"
            >
              Track Consignment
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">About Us</h2>
          <p className="text-gray-600 leading-relaxed">
            Aniket Logistic Company provides dependable and efficient transportation
            solutions. We specialize in industrial and commercial goods transport,
            serving Tata Motors and other affiliated organizations with a strong
            commitment to safety and on-time delivery.
          </p>
        </motion.div>
      </section>

      {/* SERVICES SECTION */}
      <section className="bg-gray-100 py-16 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12 text-red-700"
        >
          Our Services
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto  text-black">
          {[
            "Road Transportation",
            "Industrial Logistics",
            "Consignment Handling",
          ].map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="relative bg-white p-6 rounded-2xl shadow-xl overflow-hidden group"
            >
              <motion.div
                whileHover={{ scale: 1.08, rotate: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <h3 className="text-xl font-semibold mb-2">{service}</h3>
                <p className="text-black mb-4">
                  Safe, timely, and professional transportation services designed
                  to meet industrial logistics needs.
                </p>
                <span className="inline-block text-red-600 font-medium group-hover:underline">
                  Learn More →
                </span>
              </motion.div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition" />
            </motion.div>
          ))}
        </div>
      </section>
      {/* WHY CHOOSE US */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-8 text-center"
        >
          Why Choose Aniket Logistic?
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Trusted by Tata Motors", "On-Time Delivery", "Secure Handling"].map(
            (item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="border p-6 rounded-2xl text-center"
              >
                <p className="font-semibold">{item}</p>
              </motion.div>
            )
          )}
        </div>
      </section>

         <Footer/>

    </div>
  );
}
