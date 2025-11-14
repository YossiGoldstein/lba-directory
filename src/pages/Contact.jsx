import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronRight, 
  Phone, 
  Mail, 
  Building2, 
  MessageCircle, 
  Send,
  CheckCircle,
  MapPin
} from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!formData.subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    if (!formData.message.trim()) {
      toast.error("Please enter your message");
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission (Base44's standard form handling)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      // Scroll to success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1000);
  };

  const handleOpenChat = () => {
    const chatButton = document.querySelector('[aria-label="Open chat assistant"]');
    if (chatButton) {
      chatButton.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-cyan-100 mb-6">
            <Link
              to={createPageUrl("Home")}
              className="hover:text-white transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">Contact Us</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Get in Touch</h1>
          <p className="text-xl text-cyan-50 text-center max-w-2xl mx-auto">
            We're here to help. Whether you have a question, feedback, or need assistance, feel free to reach out.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Message */}
        {isSubmitted && (
          <div className="mb-8 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900 mb-2">Thank you!</h3>
                <p className="text-green-800">
                  Your message has been received. Someone from our team will get back to you shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Contact Info */}
          <div className="space-y-8">
            {/* Contact Information Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-cyan-600" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">LBA Directory</h3>
                  <p className="text-gray-600">
                    Powered by LBA Leagues and TIG Solutions
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Phone */}
                  <a
                    href="tel:732-600-1260"
                    className="flex items-center gap-3 p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-lg font-semibold text-gray-900 group-hover:text-cyan-700">
                        732-600-1260
                      </p>
                    </div>
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:office@lbadirectory.com"
                    className="flex items-center gap-3 p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-lg font-semibold text-gray-900 group-hover:text-cyan-700">
                        office@lbadirectory.com
                      </p>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Ask the AI Section */}
            <Card className="shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Need quick help?
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Chat with our AI Directory Assistant for instant answers to your questions.
                    </p>
                    <Button
                      onClick={handleOpenChat}
                      className="bg-cyan-600 hover:bg-cyan-700 gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat with the Directory Assistant
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card className="shadow-lg overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-cyan-600 mx-auto mb-3" />
                  <p className="text-gray-700 font-semibold">Serving the Lakewood area</p>
                  <p className="text-gray-600 text-sm mt-1">
                    Lakewood, Toms River, Jackson, and beyond
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Contact Form */}
          <div>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (732) 555-0123"
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      Subject <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help?"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us more about your question or feedback..."
                      rows={6}
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-cyan-600 hover:bg-cyan-700 gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Help Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Looking for something else?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Check out our FAQ page for quick answers to common questions, or explore our directory to find what you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              variant="outline"
              size="lg"
            >
              <Link to={createPageUrl("FAQ")}>
                Browse FAQ
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Link to={createPageUrl("Home")}>
                Explore Directory
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}