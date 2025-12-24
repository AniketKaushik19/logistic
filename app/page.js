"use client"

import { motion } from "framer-motion";
import Navbar from "./_components/Navbar.jsx"
import {useState} from 'react'
import Footer from "./_components/Footer.jsx"
import Dashboard from "./dashboard/page.js";
import GetInTouch from "./components/GetInTouch.js";
import { ShieldCheck , Clock , PackageCheck , Truck } from "lucide-react";

const features = [
  {
    title: "Trusted by Tata Motors",
    desc: "Reliable logistics partner with proven industry trust.",
    icon: ShieldCheck,
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "On-Time Delivery",
    desc: "We ensure timely delivery with real-time tracking.",
    icon: Clock,
    color: "from-green-500 to-green-600",
  },
  {
    title: "Secure Handling",
    desc: "Your consignments are handled with utmost care.",
    icon: PackageCheck,
    color: "from-purple-500 to-purple-600",
  },
];

export default function Home() {
  const [admin ,setAdmin]=useState(false)
  return (
    <div className="w-full ">
      {admin && <>
        <Navbar admin={admin}/>
        <Dashboard/>
        </> 
      }
      {!admin &&  <>
       <Navbar/>
      {/* HERO SECTION WITH FIXED BACKGROUND */}
      <section
        className="h-screen flex items-center justify-center bg-fixed bg-center bg-cover md:mt-15"
        style={{
          backgroundImage:
            "url('/tata.png')",
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
          <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur border border-blue-100 rounded-2xl shadow-lg p-8">
         {/* Heading */}
         <div className="flex items-center gap-3 mb-4">
           <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
             <Truck size={26} />
           </div>
           <h2 className="text-3xl font-bold tracking-tight text-gray-900">
             About Us
           </h2>
         </div>

        {/* Description */}
       <p className="text-gray-600 leading-relaxed text-lg">
         <span className="font-semibold text-gray-800">
           Aniket Logistic
         </span>{" "}
         provides dependable and efficient transportation solutions. We specialize in
         industrial and commercial goods transport, serving{" "}
         <span className="font-medium text-blue-600">
           Tata Motors
         </span>{" "}
         and other affiliated organizations with a strong commitment to{" "}
         <span className="inline-flex items-center gap-1 font-medium text-green-600">
           <ShieldCheck size={16} />
           safety
         </span>{" "}
         and{" "}
         <span className="font-medium text-green-600">
           on-time delivery
         </span>
           .
           </p>
            </div>
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
              </motion.div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition" />
            </motion.div>
          ))}
        </div>
      </section>
      {/* WHY CHOOSE US */}
     <section className="py-20 px-6 max-w-7xl mx-auto">
      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-3xl md:text-4xl font-bold mb-12 text-center"
      >
        Why Choose <span className="text-blue-600">Aniket Logistic</span>?
      </motion.h2>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-2xl border shadow-md hover:shadow-xl transition-all p-8 text-center"
            >
              {/* Icon */}
              <div
                className={`mx-auto mb-6 w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white group-hover:scale-110 transition`}
              >
                <Icon size={28} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold mb-2">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground text-sm">
                {item.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
       
       <section>
           <GetInTouch/>
       </section>
         <Footer/>
       </>}
    </div>
  );
}
