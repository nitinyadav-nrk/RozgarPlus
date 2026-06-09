import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send, MessageCircle, Send as TelegramIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WHATSAPP_GROUP = "https://chat.whatsapp.com/your-group-link";
const TELEGRAM_GROUP = "https://t.me/your-group-link";

export default function Contact() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message sent! We'll get back to you soon." });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Layout>
      <div className="bg-muted/30 py-16 md:py-24 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-muted-foreground">
            Have questions about the platform, a specific job, or a pending application? We're here to help.
          </p>
        </div>
      </div>

      {/* Community Groups */}
      <div className="bg-gradient-to-r from-indigo-50 to-emerald-50 border-b py-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            Join our communities
          </p>
          <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {/* WhatsApp */}
            <a
              href={WHATSAPP_GROUP}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 bg-white border border-green-100 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md hover:border-green-300 transition-all"
            >
              <div className="bg-green-500 text-white w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-base">WhatsApp Group</p>
                <p className="text-sm text-muted-foreground">
                  Join our active job-alert community
                </p>
              </div>
              <span className="ml-auto text-green-600 font-semibold text-sm group-hover:underline shrink-0">
                Join →
              </span>
            </a>

            {/* Telegram */}
            <a
              href={TELEGRAM_GROUP}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 bg-white border border-sky-100 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all"
            >
              <div className="bg-sky-500 text-white w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <TelegramIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-base">Telegram Channel</p>
                <p className="text-sm text-muted-foreground">
                  Get instant job updates & alerts
                </p>
              </div>
              <span className="ml-auto text-sky-600 font-semibold text-sm group-hover:underline shrink-0">
                Join →
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
          <div>
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            <p className="text-muted-foreground mb-8">
              Fill out the form and our team will get back to you within 24 hours. For immediate assistance with applications, please include your UTR number.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary shrink-0">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Email Support</h3>
                  <p className="text-muted-foreground">support@jobnest.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg text-green-600 shrink-0">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">WhatsApp / Call</h3>
                  <p className="text-muted-foreground">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-sky-100 p-3 rounded-lg text-sky-600 shrink-0">
                  <TelegramIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Telegram</h3>
                  <a href={TELEGRAM_GROUP} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">
                    @jobnest_official
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Office</h3>
                  <p className="text-muted-foreground">123 Tech Park, Innovation Valley<br />Bangalore, 560001</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-6">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input placeholder="Doe" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input type="email" placeholder="john@example.com" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="How can we help?" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea placeholder="Please describe your issue in detail..." className="h-32" required />
              </div>
              <Button type="submit" className="w-full h-12 gap-2 mt-4">
                <Send className="h-4 w-4" /> Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
