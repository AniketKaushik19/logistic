import { Mail, Phone, MapPin, Send, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import toast from "react-hot-toast";

export default function GetInTouch() {
    const [name , setName]=useState('')
    const [email ,setEmail]=useState('')
    const [message ,setMessage]=useState('')
    const [isLoading ,setIsLoading]=useState(false)

    const handleSubmit=async(e)=>{
        e.preventDefault()
        setIsLoading(true)
        if(!name || !email || !message){
            toast.error("Please fill all the fields")
            setIsLoading(false)
            return 
        }
        try{ 
        const response=await fetch('/api/contact',{
            method:"POST",
            headers:{
                "Content-Type":"application/json"

            },
            body:JSON.stringify({
                name, email, message
            })
        })
        const data=await response.json()
        if(data.message){
            toast.success("Message sent successfully")
            setEmail('')
            setName('')
            setMessage('')
        }
        else {
            toast.error("Failed to send message . Please try again Later.")
        }
         }catch(error){
               console.log("Error sending message:",error)
               toast.error("Failed to send message. Please try again Later.")
         }
         finally{
             setIsLoading(false)
         }
    }
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Get in Touch
          </h2>
          <p className="text-muted-foreground mt-2">
            We’d love to hear from you. Fill out the form or reach us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Email</h4>
                <p className="text-gray-600">suresh.ss75100@gmail.com</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <Phone size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Phone</h4>
                <p className="text-gray-600">+91 790509 3236</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Address</h4>
                <p className="text-gray-600">
                  Lucknow, Uttar Pradesh, India
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
            <Input placeholder="Your Name" onChange={(e)=>setName(e.target.value)}
            value={name}/>
            <Input type="email" placeholder="Your Email" onChange={(e)=>setEmail(e.target.value)}
            value={email}/>
            <Textarea placeholder="Your Message" rows={4} onChange={(e)=>setMessage(e.target.value)}
            value={message} />

            <Button className="w-full rounded-xl flex items-center gap-2 border  hover:bg-purple-600 bg-purple-500 text-white " disabled={isLoading} onClick={handleSubmit}>
                {isLoading ?
              (<>
                 <Loader className="animate-spin" size={18} />
                 Sending  Message
                </>
            ):(<>
                 <Send size={18} />
                 Send Message
             </>)
              }
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
