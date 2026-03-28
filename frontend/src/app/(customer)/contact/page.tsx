'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, ChevronDown, ChevronUp, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    details: 'support@argifts.com',
    sub: 'We reply within 24 hours',
    href: 'mailto:support@argifts.com',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Phone,
    title: 'Call Us',
    details: '+91 1800-000-000',
    sub: 'Mon–Sat, 10AM–7PM IST',
    href: 'tel:+911800000000',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: MapPin,
    title: 'Our Address',
    details: 'Mumbai, Maharashtra',
    sub: 'India – 400001',
    href: '#',
    color: 'from-purple-500 to-violet-500',
  },
  {
    icon: Clock,
    title: 'Business Hours',
    details: 'Mon – Sat: 10AM–7PM',
    sub: 'Sunday: Closed',
    href: '#',
    color: 'from-amber-500 to-orange-500',
  },
];

const faqs = [
  {
    q: 'How does the AR gift work?',
    a: 'When a recipient receives your AR gift, they simply open their smartphone camera and point it at the image on the gift. The AR system detects the image and overlays your personalized video message right on top of it—no app required!',
  },
  {
    q: 'Do recipients need a special app to scan?',
    a: 'No app is needed. The AR experience is powered by web-based technology. Your recipient just needs a modern smartphone browser (Chrome, Safari, etc.) and camera access.',
  },
  {
    q: 'What video formats are supported for upload?',
    a: 'We support MP4 and MOV formats up to 50MB. For best results, use a 16:9 landscape video under 60 seconds in length.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Standard delivery takes 5–7 business days across India. Express delivery (2–3 business days) is available at an additional charge. Metro cities typically receive orders faster.',
  },
  {
    q: 'Can I upload my own photo instead of a template?',
    a: 'Absolutely! During the customization step, you can choose to upload your own JPG or PNG image (max 10MB) instead of selecting from our template gallery.',
  },
  {
    q: 'What is your return and refund policy?',
    a: 'Since each product is custom-made, we do not accept returns due to personal preference. However, if your product arrives damaged or defective, please contact us within 48 hours with photos and we\'ll replace it free of charge.',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Partial<ContactForm>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const validate = () => {
    const newErrors: Partial<ContactForm> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Valid email required';
    if (!form.subject.trim()) newErrors.subject = 'Subject is required';
    if (!form.message.trim() || form.message.length < 20) newErrors.message = 'Message must be at least 20 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
  };

  const update = (field: keyof ContactForm, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-[#1d1c1c] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 bg-[#F5A900]/20 border border-[#F5A900]/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <MessageSquare className="w-8 h-8 text-[#F5A900]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Get in Touch</h1>
            <p className="text-xl text-[#969696] max-w-xl mx-auto">
              Have a question, feedback, or need help with your order? We're here for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {contactInfo.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.a
                  key={item.title}
                  href={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm mb-0.5">{item.title}</p>
                  <p className="text-gray-700 text-sm font-medium">{item.details}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{item.sub}</p>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form + Map */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Send Us a Message</h2>
                <p className="text-gray-500 text-sm mb-6">Fill the form below and we'll respond within 24 hours.</p>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-500 mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                      className="btn-primary"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => update('name', e.target.value)}
                          placeholder="Your name"
                          className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => update('email', e.target.value)}
                          placeholder="your@email.com"
                          className={`input-field ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => update('phone', e.target.value)}
                          placeholder="9876543210"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
                        <select
                          value={form.subject}
                          onChange={(e) => update('subject', e.target.value)}
                          className={`input-field ${errors.subject ? 'border-red-400 focus:ring-red-400' : ''}`}
                        >
                          <option value="">Select a subject</option>
                          <option value="Order Inquiry">Order Inquiry</option>
                          <option value="AR Technical Support">AR Technical Support</option>
                          <option value="Customization Help">Customization Help</option>
                          <option value="Returns & Refunds">Returns & Refunds</option>
                          <option value="Bulk / Corporate Order">Bulk / Corporate Order</option>
                          <option value="General Feedback">General Feedback</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => update('message', e.target.value)}
                        rows={5}
                        placeholder="Describe your question or issue in detail..."
                        className={`input-field resize-none ${errors.message ? 'border-red-400 focus:ring-red-400' : ''}`}
                      />
                      <div className="flex justify-between mt-1">
                        {errors.message
                          ? <p className="text-red-500 text-xs">{errors.message}</p>
                          : <span />
                        }
                        <span className="text-xs text-gray-400">{form.message.length}/500</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-4"
                    >
                      {loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                      ) : (
                        <><Send className="w-5 h-5" /> Send Message</>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Map Placeholder + Extra Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Map placeholder */}
              <div className="bg-gradient-to-br from-[#1d1c1c] to-[#2a2a2a] rounded-3xl overflow-hidden h-56 relative flex items-center justify-center border border-[#333333]">
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />
                <div className="text-center text-white relative z-10">
                  <MapPin className="w-10 h-10 mx-auto mb-2 opacity-60" />
                  <p className="font-semibold">Mumbai, Maharashtra</p>
                  <p className="text-white/60 text-sm">India</p>
                </div>
              </div>

              {/* Social / Quick contact */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Quick Contacts</h3>
                <div className="space-y-3">
                  {[
                    { label: 'WhatsApp', value: '+91 98765 43210', emoji: '💬' },
                    { label: 'Email', value: 'support@argifts.com', emoji: '📧' },
                    { label: 'Instagram', value: '@argifts.official', emoji: '📸' },
                  ].map((c) => (
                    <div key={c.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-lg">{c.emoji}</span>
                      <div>
                        <p className="text-xs text-gray-400">{c.label}</p>
                        <p className="text-sm font-medium text-gray-800">{c.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response time */}
              <div className="bg-[#FFFBEB] rounded-2xl p-5 border border-[#fde68a]">
                <p className="font-semibold text-[#1d1c1c] mb-1">⚡ Fast Response Guarantee</p>
                <p className="text-[#555555] text-sm leading-relaxed">
                  We respond to all queries within 24 hours on business days. For urgent order issues, WhatsApp us for immediate assistance.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-gray-500">Quick answers to the most common questions</p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4 text-sm md:text-base">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-5 h-5 text-[#F5A900] flex-shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-5 pb-5"
                  >
                    <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
