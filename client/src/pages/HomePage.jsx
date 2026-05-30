import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Star, ChevronRight, Phone, ArrowRight,
  Sparkles, Users, Percent, Quote, Send, Heart, Eye
} from 'lucide-react';

/* ===================== HERO ===================== */
const HeroSection = () => {
  const scrollToEvents = () => {
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <img src="/images/hero.png" alt="Veto Restaurant" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-950/60 via-brand-950/50 to-brand-950" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-950/70 to-transparent" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold-400/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-slide-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span className="text-gold-400 text-xs tracking-widest uppercase font-medium">Veto Café & Restaurant</span>
        </div>

        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white mb-6 leading-[1.05]">
          Live a Different
          <span className="block text-gold-400">Experience</span>
          <span className="block text-white">Every Day</span>
        </h1>

        <p className="text-brand-300 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Fine dining, live events, crafted cocktails, and unforgettable moments await you at Alexandria's most exclusive destination.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/reserve"
            className="px-8 py-3.5 rounded-xl bg-gold-500 text-brand-900 font-semibold text-sm tracking-wide hover:bg-gold-400 transition-all duration-300 shadow-lg shadow-gold-500/20 flex items-center gap-2"
          >
            Book Now <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={scrollToEvents}
            className="px-8 py-3.5 rounded-xl border border-white/20 text-white font-medium text-sm hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
          >
            Explore Events <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-brand-500 text-[10px] tracking-widest uppercase">Scroll</span>
        <div className="w-5 h-8 rounded-full border-2 border-brand-600 flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-brand-500 rounded-full" />
        </div>
      </div>
    </section>
  );
};

/* ===================== EVENTS ===================== */
const EventsSection = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/events?active=true')
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setEvents(d.data?.events || []); })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const getCountdown = (eventDate) => {
    const now = new Date();
    const target = new Date(eventDate);
    const diff = target - now;
    if (diff <= 0) return 'Today!';
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days === 1 ? 'Tomorrow' : `${days} days left`;
  };

  return (
    <section id="events" className="py-20 sm:py-28 px-4 bg-brand-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-gold-400 text-xs tracking-widest uppercase font-medium">Upcoming</span>
          <h2 className="font-serif text-4xl sm:text-5xl text-white mt-3 mb-4">Events & Experiences</h2>
          <p className="text-brand-400 max-w-md mx-auto">From live music to sushi masterclasses, every night is unique at Veto.</p>
        </div>

        {loading ? (
          <div className="text-center text-brand-500 py-12">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center text-brand-500 py-12">No upcoming events. Check back soon!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <div key={ev.id} className="group relative bg-brand-900/40 border border-brand-700/30 rounded-2xl overflow-hidden hover:border-gold-500/30 transition-all duration-500">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={ev.image_url || '/images/hero.png'}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => { e.target.src = '/images/hero.png'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-900 to-transparent" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-gold-500/90 text-brand-900 text-[10px] font-bold uppercase tracking-wider">
                    {getCountdown(ev.event_date)}
                  </div>
                  {ev.is_featured && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-rose-500/90 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Featured
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-serif text-lg text-white mb-2 group-hover:text-gold-400 transition-colors">{ev.title}</h3>
                  <p className="text-brand-400 text-xs leading-relaxed mb-4 line-clamp-2">{ev.description}</p>

                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="flex items-center gap-1.5 text-brand-500 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-gold-400" />
                      {formatDate(ev.event_date)}
                    </div>
                    {ev.event_time && (
                      <div className="flex items-center gap-1.5 text-brand-500 text-xs">
                        <Clock className="w-3.5 h-3.5 text-gold-400" />
                        {ev.event_time.slice(0, 5)}
                      </div>
                    )}
                    {ev.location && (
                      <div className="flex items-center gap-1.5 text-brand-500 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-gold-400" />
                        {ev.location}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {ev.price != null && parseFloat(ev.price) > 0 && (
                      <span className="text-gold-400 font-semibold text-sm">{parseFloat(ev.price).toFixed(0)} EGP</span>
                    )}
                    <Link
                      to="/reserve"
                      className="ml-auto px-4 py-2 rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/20 hover:bg-gold-500/20 transition-colors text-xs font-medium flex items-center gap-1.5"
                    >
                      Book Now <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* ===================== OFFERS ===================== */
const OffersSection = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/offers?active=true&featured=true')
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setOffers(d.data?.offers || []); })
      .finally(() => setLoading(false));
  }, []);

  const isUrgent = (endDate) => {
    if (!endDate) return false;
    const daysLeft = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7;
  };

  return (
    <section className="py-20 sm:py-28 px-4 bg-gradient-to-b from-brand-950 to-brand-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-gold-400 text-xs tracking-widest uppercase font-medium">Limited Time</span>
          <h2 className="font-serif text-4xl sm:text-5xl text-white mt-3 mb-4">Special Offers</h2>
          <p className="text-brand-400 max-w-md mx-auto">Exclusive deals crafted for our guests. Don't miss out!</p>
        </div>

        {loading ? (
          <div className="text-center text-brand-500 py-12">Loading offers...</div>
        ) : offers.length === 0 ? (
          <div className="text-center text-brand-500 py-12">No active offers right now.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className={`relative rounded-2xl p-6 border transition-all duration-500 ${
                  offer.is_featured
                    ? 'bg-gradient-to-br from-gold-500/10 to-brand-900/40 border-gold-500/20'
                    : 'bg-brand-900/30 border-brand-700/30 hover:border-brand-600/40'
                }`}
              >
                {isUrgent(offer.end_date) && (
                  <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Percent className="w-3 h-3" /> Ends Soon
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${offer.is_featured ? 'bg-gold-500/15 border border-gold-500/20' : 'bg-brand-800/50 border border-brand-700/30'}`}>
                    <Percent className={`w-6 h-6 ${offer.is_featured ? 'text-gold-400' : 'text-brand-400'}`} />
                  </div>
                  {offer.discount_percent != null && parseInt(offer.discount_percent) > 0 && (
                    <span className={`text-3xl font-bold ${offer.is_featured ? 'text-gold-400' : 'text-white'}`}>
                      {offer.discount_percent}%
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-xl text-white mb-2">{offer.title}</h3>
                <p className="text-brand-400 text-sm leading-relaxed mb-4">{offer.description}</p>

                {offer.code && (
                  <div className="mb-4 px-3 py-2 rounded-lg bg-brand-800/40 border border-dashed border-brand-600/40 text-center">
                    <span className="text-brand-500 text-[10px] uppercase tracking-wider">Use Code</span>
                    <p className="text-gold-400 font-mono font-bold text-sm tracking-widest">{offer.code}</p>
                  </div>
                )}

                {offer.end_date && (
                  <p className="text-brand-500 text-xs mb-4">
                    Valid until {new Date(offer.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}

                <Link
                  to="/reserve"
                  className="block w-full text-center py-2.5 rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/20 hover:bg-gold-500/20 transition-colors text-sm font-medium"
                >
                  Reserve with Offer
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* ===================== REVIEWS ===================== */
const ReviewsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ customerName: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchReviews = () => {
    fetch('/api/v1/reviews')
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setReviews(d.data?.reviews || []); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitted(true);
        setFormData({ customerName: '', rating: 5, comment: '' });
        setTimeout(() => setSubmitted(false), 4000);
      }
    } catch {}
    setSubmitting(false);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <section className="py-20 sm:py-28 px-4 bg-brand-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-gold-400 text-xs tracking-widest uppercase font-medium">Testimonials</span>
          <h2 className="font-serif text-4xl sm:text-5xl text-white mt-3 mb-4">What Our Guests Say</h2>
          <div className="flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-gold-400 fill-gold-400" />
            <span className="text-white text-xl font-bold">{avgRating}</span>
            <span className="text-brand-500 text-sm">({reviews.length} reviews)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reviews List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center text-brand-500 py-12">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center text-brand-500 py-12">No reviews yet. Be the first!</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-brand-900/30 border border-brand-700/20 rounded-2xl p-5">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-gold-400 fill-gold-400' : 'text-brand-700'}`} />
                      ))}
                    </div>
                    <p className="text-brand-300 text-sm leading-relaxed mb-4">"{r.comment}"</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                        <span className="text-gold-400 text-xs font-bold">{String(r.customer_name || '').charAt(0)}</span>
                      </div>
                      <span className="text-white text-xs font-medium">{r.customer_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Review Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-brand-900/40 border border-brand-700/30 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-5">
                <Quote className="w-5 h-5 text-gold-400" />
                <h3 className="font-serif text-lg text-white">Share Your Experience</h3>
              </div>

              {submitted ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                  <p className="text-emerald-400 text-sm">Thank you! Your review will appear after approval.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-brand-500 uppercase tracking-wider mb-1.5">Your Name</label>
                    <input
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="John Doe"
                      className="input-premium w-full text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-brand-500 uppercase tracking-wider mb-1.5">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: n })}
                          className="p-1 transition-colors"
                        >
                          <Star className={`w-6 h-6 ${n <= formData.rating ? 'text-gold-400 fill-gold-400' : 'text-brand-700'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-brand-500 uppercase tracking-wider mb-1.5">Your Review</label>
                    <textarea
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      placeholder="Tell us about your visit..."
                      rows={4}
                      className="input-premium w-full resize-none text-sm"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-gold-500 text-brand-900 font-semibold text-sm hover:bg-gold-400 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {submitting ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit Review</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ===================== CTA ===================== */
const CTASection = () => (
  <section className="py-20 sm:py-28 px-4 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 via-transparent to-gold-500/5" />
    <div className="max-w-4xl mx-auto text-center relative z-10">
      <h2 className="font-serif text-4xl sm:text-5xl text-white mb-4">
        Ready for an <span className="text-gold-400">Unforgettable</span> Evening?
      </h2>
      <p className="text-brand-400 text-base sm:text-lg max-w-lg mx-auto mb-10">
        Reserve your table now and let us craft a dining experience tailored just for you.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/reserve"
          className="px-10 py-4 rounded-xl bg-gold-500 text-brand-900 font-semibold text-sm tracking-wide hover:bg-gold-400 transition-all duration-300 shadow-lg shadow-gold-500/20 flex items-center gap-2"
        >
          Book Your Table <ArrowRight className="w-4 h-4" />
        </Link>
        <a
          href="https://wa.me/201050101098"
          target="_blank"
          rel="noopener noreferrer"
          className="px-10 py-4 rounded-xl border border-emerald-500/30 text-emerald-400 font-medium text-sm hover:bg-emerald-500/10 transition-all duration-300 flex items-center gap-2"
        >
          <Phone className="w-4 h-4" /> WhatsApp Us
        </a>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-brand-500 text-xs">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span>Up to 20 guests</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Open 11 AM — 12 AM</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          <span>Gleem Bay · Montaza</span>
        </div>
      </div>
    </div>
  </section>
);

/* ===================== HOMEPAGE ===================== */
const HomePage = () => {
  return (
    <div className="bg-brand-950">
      <HeroSection />
      <EventsSection />
      <OffersSection />
      <ReviewsSection />
      <CTASection />
    </div>
  );
};

export default HomePage;
