import ContactForm from "@/components/sections/ContactForm";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";

export const metadata = {
    title: "Contact Us | CoderNest",
    description: "Get in touch with CoderNest for your next digital project. We are ready to help you scale.",
};

export default function ContactPage() {
    return (
        <div className="pt-32 pb-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Let's Build Together</h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Have a project in mind? We'd love to hear about it. Drop us a message and we'll get back to you sooner than you think.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                    <div className="lg:col-span-1 space-y-8">
                        <div className="flex items-start gap-5">
                            <div className="p-3 bg-blue-600/10 rounded-2xl">
                                <Mail className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Email Us</h4>
                                <p className="text-slate-400">hello@codernest.agency</p>
                                <p className="text-slate-400">support@codernest.agency</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-5">
                            <div className="p-3 bg-purple-600/10 rounded-2xl">
                                <MessageSquare className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Live Chat</h4>
                                <p className="text-slate-400">Average response: 15 mins</p>
                                <button className="text-blue-500 font-semibold hover:underline mt-1 text-sm">Open Chat</button>
                            </div>
                        </div>

                        <div className="flex items-start gap-5">
                            <div className="p-3 bg-pink-600/10 rounded-2xl">
                                <Phone className="w-6 h-6 text-pink-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Call Us</h4>
                                <p className="text-slate-400">+1 (555) 000-0000</p>
                                <p className="text-slate-400">Mon-Fri, 9am - 6pm EST</p>
                            </div>
                        </div>

                        <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-700 text-white">
                            <h4 className="text-2xl font-bold mb-4">Start a Project Instantly</h4>
                            <p className="text-blue-100 mb-6 text-sm">
                                Ready to skip the queue? Fill out our AI quote calculator and get an estimate in seconds.
                            </p>
                            <button className="w-full py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-opacity-90 transition-all">
                                Try AI Calculator
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <ContactForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
